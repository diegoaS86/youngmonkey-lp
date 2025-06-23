<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require __DIR__ . '/php/PHPMailer/src/Exception.php';
require __DIR__ . '/php/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/php/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cria log para debug
file_put_contents(__DIR__ . '/debug_log.txt', "===> Script iniciado\n", FILE_APPEND);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Acesso negado."]);
    exit;
}

file_put_contents(__DIR__ . '/debug_log.txt', "===> POST recebido\n", FILE_APPEND);
file_put_contents(__DIR__ . '/debug_log.txt', json_encode($_POST, JSON_PRETTY_PRINT), FILE_APPEND);

$nome     = isset($_POST["nome"]) ? trim($_POST["nome"]) : '';
$email    = isset($_POST["email"]) ? trim($_POST["email"]) : '';

if ($nome === '' || $email === '') {
    echo json_encode(["status" => "error", "message" => "Preencha todos os campos obrigatórios."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "E-mail inválido."]);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'diego.rep127@gmail.com';
    $mail->Password   = 'yvdpbprmqcumqvsg'; // Senha de app
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('diego.rep127@gmail.com', 'Formulário do Site');
    $mail->addAddress('diego.rep127@gmail.com', 'Diego Silva');

    $mail->isHTML(false);
    $mail->Body    = "Nome: $nome\nE-mail: $email\n";

    if (!$mail->send()) {
        echo json_encode(["status" => "error", "message" => "Erro ao enviar: {$mail->ErrorInfo}"]);
    } else {
        echo json_encode(["status" => "success", "message" => "Mensagem enviada com sucesso!"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Exceção: {$e->getMessage()}"]);
}
?>
