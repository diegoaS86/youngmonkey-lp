<?php
session_start();

require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

// ----- Segurança -----
// Honeypot
if (!empty($_POST['website'])) {
    http_response_code(200);
    exit;
}

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido']);
    exit;
}

// Timer anti-bot
$start = isset($_POST['startTime']) ? (int) $_POST['startTime'] : 0;
if (time() - $start < 5) {
    http_response_code(200);
    exit;
}

// CSRF
if (empty($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Requisição inválida (CSRF)']);
    exit;
}

// Rate Limiting via APCu
if (function_exists('apcu_fetch')) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = 'form_submission_ip_' . $ip;
    $submission_count = apcu_fetch($key) ?: 0;

    if ($submission_count >= 5) {
        echo json_encode(['status' => 'error', 'message' => 'Limite de envios atingido. Tente mais tarde.']);
        exit;
    }
    apcu_store($key, $submission_count + 1, 3600);
}

// ----- Processamento do Formulário -----
$nome  = filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);

if (empty($nome) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Preencha um nome e um e-mail válidos.'
    ]);
    exit;
}

$subject = 'Novo Contato do Site Young Monkey';
$body    = "Contato recebido:\n\nNome: $nome\nEmail: $email\n";

// ----- Envio do E-mail com PHPMailer -----
$mail = new PHPMailer(true);
try {
    // Configurações do SMTP via variáveis de ambiente
    $mail->SMTPDebug  = 0;
    $mail->isSMTP();
    $mail->Host       = getenv('SMTP_HOST');
    $mail->SMTPAuth   = true;
    $mail->Username   = getenv('SMTP_USER');
    $mail->Password   = getenv('SMTP_PASS');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = getenv('SMTP_PORT') ?: 587;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(getenv('SMTP_USER'), 'Contato Site');
    $mail->addAddress(getenv('CONTACT_RECIPIENT'), 'Diego Silva');
    $mail->addReplyTo($email, $nome);

    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();

    echo json_encode([
        'status' => 'success',
        'message' => "Obrigado, $nome! Sua mensagem foi enviada com sucesso."
    ]);
} catch (Exception $e) {
    error_log('Erro PHPMailer: ' . $mail->ErrorInfo);
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha no envio. Tente novamente mais tarde.'
    ]);
}