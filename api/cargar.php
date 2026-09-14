<?php
/* cargar.php — devuelve al navegador la configuración guardada en el servidor.
   Nunca expone el hash de la contraseña de administrador. */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

 $archivo = __DIR__ . '/../data/privado.json';

if (!is_file($archivo)) {
  echo json_encode(['ok' => true, 'configurado' => false]);
  exit;
}

 $datos = json_decode(file_get_contents($archivo), true);

if (!is_array($datos) || empty($datos['clave'])) {
  echo json_encode(['ok' => true, 'configurado' => false]);
  exit;
}

/* La contraseña admin jamás viaja al navegador */
unset($datos['admin']);

echo json_encode([
  'ok' => true,
  'configurado' => true,
  'datos' => $datos
]);