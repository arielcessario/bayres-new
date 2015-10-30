<?php
/**
 * Created by PhpStorm.
 * User: emaneff
 * Date: 28/04/2015
 * Time: 01:33 PM
 * Send a email with a new password
 */

require 'PHPMailerAutoload.php';

$data = file_get_contents("php://input");

// Decode data from js
$decoded = json_decode($data);


if ($decoded != null) {
    if ($decoded->function == 'sendConsulta') {
        sendConsulta($decoded->contactoForm);
    } else if ($decoded->function == 'sendCancelarCarritoComprador') {
        sendCancelarCarritoComprador($decoded->usuario, $decoded->carrito);
    } else if ($decoded->function == 'sendCancelarCarritoVendedor') {
        sendCancelarCarritoVendedor($decoded->usuario, $decoded->email, $decoded->carrito);
    } else if ($decoded->function == 'sendCarritoComprador') {
        sendCarritoComprador($decoded->email, $decoded->nombre, $decoded->carrito, $decoded->sucursal, $decoded->direccion);
    } else if ($decoded->function == 'sendCarritoVendedor') {
        sendCarritoVendedor($decoded->email, $decoded->nombre, $decoded->carrito, $decoded->sucursal, $decoded->direccion);
    }
}

/**
 * @param $contactoForm
 */
function sendConsulta($contactoForm)
{
    $contacto = json_decode($contactoForm);

    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'gator4184.hostgator.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'ventas@ac-desarrollos.com';                 // SMTP username
    $mail->Password = 'ventas';                           // SMTP password
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;

    $mail->From = $contacto->mail;
    $mail->FromName = $contacto->apellido . ", " . $contacto->nombre;
    $mail->addAddress('mmaneff@gmail.com');     // Add a recipient
    $mail->addAddress('juan.dilello@gmail.com');               // Name is optional
    //$mail->addAddress('info@bayresnoproblem.com.ar');  //ESTE CORREO SOLO SE HABILITA EN PRODUCCION
    $mail->isHTML(true);    // Name is optional

    $mail->Subject = "Consulta de " . $contacto->apellido . ", " . $contacto->nombre;
    $mail->Body = "<table>
                    <tr>
                        <td>Consulta de " . $contacto->apellido . ", " . $contacto->nombre . "</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>" . $contacto->consulta . "</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>" . $contacto->mail . "</td>
                    </tr>
                </table>";
    //$mail->AltBody = "Nuevo Mail:" . $new_password;

    if (!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }
}

/**
 * @param $usuario
 * @param $carrito
 */
function sendCancelarCarritoComprador($usuario, $carrito)
{
    $carritoInfo = json_decode($carrito);

    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'gator4184.hostgator.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'ventas@ac-desarrollos.com';                 // SMTP username
    $mail->Password = 'ventas';                           // SMTP password
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;

    $mail->From = 'info@bayresnoproblem.com.ar'; //ESTE CORREO SOLO SE HABILITA EN PRODUCCION
    $mail->FromName = 'Bayres No Problem';
    $mail->addAddress($usuario);     // Add a recipient
    $mail->addAddress('juan.dilello@gmail.com');               // Name is optional
    $mail->isHTML(true);    // Name is optional

    $mail->Subject = "Cancelar Pedido " . $carritoInfo->carrito_id;
    $mail->Body = "<table>
                    <tr>
                        <td>Su pedido " . $carritoInfo->carrito_id . " fue cancelado</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Fecha del Pedido: " . $carritoInfo->fecha ."</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Total del Pedido: " . $carritoInfo->total ."</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Saludos Bayres No Problem</td>
                    </tr>
                </table>";
    //$mail->AltBody = "Nuevo Mail:" . $new_password;

    if (!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }
}

/**
 * @param $destinatario
 * @param $mensaje
 */
function sendCancelarCarritoVendedor($usuario, $email, $carrito)
{
    $carritoInfo = json_decode($carrito);

    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'gator4184.hostgator.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'ventas@ac-desarrollos.com';                 // SMTP username
    $mail->Password = 'ventas';                           // SMTP password
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;

    $mail->From = $email;
    $mail->FromName = $usuario;
    $mail->addAddress($email);     // Add a recipient
    $mail->addAddress('juan.dilello@gmail.com');               // Name is optional
    $mail->isHTML(true);    // Name is optional

    $mail->Subject = "Cancelar Pedido " . $carritoInfo->carrito_id;
    $mail->Body = "<table>
                    <tr>
                        <td>El cliente " . $usuario . "</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Solicito cancelar el pedido: " . $carritoInfo->carrito_id ."</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Fecha del Pedido: " . $carritoInfo->fecha ."</td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Total del Pedido: " . $carritoInfo->total ."</td>
                    </tr>
                </table>";
    //$mail->AltBody = "Nuevo Mail:" . $new_password;

    if (!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }
}

/**
 * @param $email
 * @param $nombre
 * @param $carrito
 * @param $sucursal
 * @param $direccion
 */
function sendCarritoComprador($email, $nombre, $carrito, $sucursal, $direccion)
{
    $micarrito = json_decode($carrito);
    $detalles = '';

    foreach ($micarrito->productos as $item) {
        $number = $item->cantidad * $item->precio_unitario;
        $total = number_format((float)$number, 2, '.', '');
        $detalles = $detalles . '<tr><td style="text-align:left">' . $item->nombre . '</td><td style="text-align:right">' . $item->precio_unitario . '</td><td style="text-align:right">' . $item->cantidad . '</td><td style="text-align:right">' . $total . '</td></tr>';
    }

    $message = '<html><body><div style="font-family:Arial,sans-serif;font-size:15px;color:#006837; color:rgb(0,104,55);margin:0 auto; width:635px;">';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); border-style:Solid; border-color:#000000; border-color:rgba(0, 0, 0, 1); border-width:1px; left:-14px; top:-7px; width:635px;">';
    $message .= '<div style="background-image: background-repeat:no-repeat; width:606px; height:176px;"><img src="http://192.185.67.199/~arielces/animations/img/logo.png"></div>';
    $message .= '<div style="text-align:center;color:#fff;">';
    $message .= '<div>Suc. Once (15-3049-8691) - Suc. Flores (15-6676-2685) - Suc. Almagro (15-3041-2252)</div>';
    $message .= '<div><a href="info@bayresnoproblem.com.ar" style="text-decoration:none;color:#fff;">info@bayresnoproblem.com.ar</a></div></div>';
    $message .= '<div style="color:#000;background:#FFFFFF; background:rgba(255,255,255,1); border-style:Solid; border-color:#000000; border-color:rgba(0,0,0,1); border-width:1px; margin: 40px 10px 0 10px; border-radius:12px; -moz-border-radius: 12px; -webkit-border-radius: 12px;padding-bottom: 35px;">';
    $message .= '<div style="font-weight:bold;text-align:center;font-size:1.5em; margin-top:10px;">Estimado '. $nombre .'</div>';
    $message .= '<div style="margin-top:20px;text-align:center;">Gracias por comprar con nosotros.</div>';
    $message .= '<div style="text-align:center;">Abajo encontrara los detalles de la orden de compra.</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Numero de Pedido: </label>' . $micarrito->carrito_id . '</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Datos del Pedido: </label>http://192.185.67.199/~arielces/animations/#/commerce/cuenta</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Fecha del Pedido: </label>' . $micarrito->fecha . '</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Contenido del Pedido:</label></div>';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); margin:0 auto; padding:10px; border-radius:12px; -moz-border-radius:12px; -webkit-border-radius:12px; min-height: 200px; margin-top:5%;color:#fff;margin-left: 5px;margin-right: 5px;">';
    $message .= '<table style="font-size:12px;color:#fff;width:100%"><tr><th style="font-size:14px;text-align:left">Producto</th><th style="font-size:14px;text-align:right">Precio</th><th style="font-size:14px;text-align:right">Cantidad</th><th style="font-size:14px;text-align:right">Total</th></tr>';
    $message .= ''. $detalles .'';
    $message .= '</table></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:22px;">Subtotal: </label><span style="font-size:20px; color:#006837;">$' . number_format((float)$micarrito->total, 2, '.', '') . '</span></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:22px;">Total: </label><span style="font-size:20px; color:#006837;">$' . number_format((float)$micarrito->total, 2, '.', '') . '</span></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:14px;">Metodos de pago: Contra reembolso, Solo Capital y Gran Buenos Aires.</label></div>';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); padding:10px; border-radius:12px; -moz-border-radius:12px; -webkit-border-radius:12px; margin-top:5%;color:#fff;margin-left: 5px;margin-right: 5px;">';
    $message .= '<div style="font-size:18px; font-weight:bold; margin:10px 0 0 10px;">Direccion de Envio:</div>';
    $message .= '<div style="font-size:16px; margin-left:10px;">'. $nombre .'</div>';
    $message .= '<div style="font-size:16px; margin-left:10px;">'. $direccion .'</div>';
    $message .= '<div style="font-size:16px; margin:0 0 10px 10px;">'. $sucursal .'</div>';
    $message .= '</div><div style="text-align:center;font-weight: bold;margin-top: 15px;">Gracias por su compra</div></div></div>';
    $message .= '</table>';
    $message .= '</div></body></html>';

    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'gator4184.hostgator.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'ventas@ac-desarrollos.com';                 // SMTP username
    $mail->Password = 'ventas';                           // SMTP password
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;

    $mail->From = 'mmaneff@gmail.com';
    //$mail->From = 'info@bayresnoproblem.com.ar'; //ESTE CORREO SOLO SE HABILITA EN PRODUCCION
    $mail->FromName = 'Bayres No Problem';
    $mail->addAddress($email);     // Add a recipient
    $mail->addAddress('juan.dilello@gmail.com');               // Name is optional
    $mail->isHTML(true);    // Name is optional

    $mail->Subject = 'Detalle de Compra Nro ' . $micarrito->carrito_id;
    $mail->Body = $message;
    //$mail->AltBody = "Nuevo Mail:" . $new_password;

    if (!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }
}

/**
 * @param $email
 * @param $nombre
 * @param $carrito
 * @param $sucursal
 * @param $direccion
 */
function sendCarritoVendedor($email, $nombre, $carrito, $sucursal, $direccion)
{
    $micarrito = json_decode($carrito);
    $detalles = '';

    foreach ($micarrito->productos as $item) {
        $number = $item->cantidad * $item->precio_unitario;
        $total = number_format((float)$number, 2, '.', '');
        $detalles = $detalles . '<tr><td style="text-align:left">' . $item->nombre . '</td><td style="text-align:right">' . $item->precio_unitario . '</td><td style="text-align:right">' . $item->cantidad . '</td><td style="text-align:right">' . $total . '</td></tr>';
    }

    $message = '<html><body><div style="font-family:Arial,sans-serif;font-size:15px;color:#006837; color:rgb(0,104,55);margin:0 auto; width:635px;">';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); border-style:Solid; border-color:#000000; border-color:rgba(0, 0, 0, 1); border-width:1px; left:-14px; top:-7px; width:635px; ">';
    $message .= '<div style="background-image: background-repeat:no-repeat; width:606px; height:176px;"><img src="http://192.185.67.199/~arielces/animations/img/logo.png"></div>';
    $message .= '<div style="color:#000;background:#FFFFFF; background:rgba(255,255,255,1); border-style:Solid; border-color:#000000; border-color:rgba(0,0,0,1); border-width:1px; margin: 40px 10px 30px 10px; border-radius:12px; -moz-border-radius: 12px; -webkit-border-radius: 12px;padding-bottom: 35px;">';
    $message .= '<div style="font-weight:bold;text-align:center;font-size:1.5em; margin-top:10px;"> Cliente '. $nombre .'</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Numero de Pedido: </label>' . $micarrito->carrito_id . '</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Fecha del Pedido: </label>' . $micarrito->fecha . '</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Contenido del Pedido:</label></div>';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); margin:0 auto; padding:10px; border-radius:12px; -moz-border-radius:12px; -webkit-border-radius:12px; min-height: 200px; margin-top:5%;color:#fff;margin-left: 5px;margin-right: 5px;">';
    $message .= '<table style="font-size:12px;color:#fff;width:100%"><tr><th style="font-size:14px;text-align:left">Producto</th><th style="font-size:14px;text-align:right">Precio</th><th style="font-size:14px;text-align:right">Cantidad</th><th style="font-size:14px;text-align:right">Total</th></tr>';
    $message .= ''. $detalles .'';
    $message .= '</table></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:22px;">Subtotal: $</label><span style="font-size:20px; color:#006837;">' . number_format((float)$micarrito->total, 2, '.', '') . '</span></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:22px;">Total: $</label><span style="font-size:20px; color:#006837;">' . number_format((float)$micarrito->total, 2, '.', '') . '</span></div>';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); padding:10px; border-radius:12px; -moz-border-radius:12px; -webkit-border-radius:12px; margin-top:5%;color:#fff;margin-left: 5px;margin-right: 5px;">';
    $message .= '<div style="font-size:18px; font-weight:bold; margin:10px 0 0 10px;">Direccion de Envio:</div>';
    $message .= '<div style="font-size:16px; margin-left:10px;">'. $nombre .'</div>';
    $message .= '<div style="font-size:16px; margin-left:10px;">'. $direccion .'</div>';
    $message .= '<div style="font-size:16px; margin:0 0 10px 10px;">'. $sucursal .'</div>';
    $message .= '</div></div></div>';
    $message .= '</table>';
    $message .= '</div></body></html>';

    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'gator4184.hostgator.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'ventas@ac-desarrollos.com';                 // SMTP username
    $mail->Password = 'ventas';                           // SMTP password
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;

    $mail->From = $email;
    $mail->FromName = 'Bayres No Problem';
    $mail->addAddress('mmaneff@gmail.com');     // Add a recipient
    $mail->addAddress('juan.dilello@gmail.com');               // Name is optional
    //$mail->addAddress('info@bayresnoproblem.com.ar'); //ESTE CORREO SOLO SE HABILITA EN PRODUCCION
    $mail->isHTML(true);    // Name is optional

    $mail->Subject = 'Detalle de Compra Nro ' . $micarrito->carrito_id . ' - Cliente ' . $nombre;
    $mail->Body = $message;
    //$mail->AltBody = "Nuevo Mail:" . $new_password;

    if (!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }
}