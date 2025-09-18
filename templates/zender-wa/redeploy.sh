#!/bin/bash
# Script para forzar redeploy y actualización de imagen en EasyPanel

SERVICE_NAME="${1:-zender-wa}"
IMAGE_NAME="${2:-renatoascencio/zender-wa:v2.1.3}"

echo "🔄 Iniciando redeploy de $SERVICE_NAME..."

# Pull de la última imagen
echo "📦 Descargando última versión de imagen..."
docker pull $IMAGE_NAME

# Obtener el container ID actual
CONTAINER_ID=$(docker ps -q -f name=$SERVICE_NAME)

if [ -n "$CONTAINER_ID" ]; then
    echo "🛑 Deteniendo container actual..."
    docker stop $CONTAINER_ID

    echo "🗑️ Eliminando container antiguo..."
    docker rm $CONTAINER_ID
fi

# Recrear el container con la nueva imagen
echo "🚀 Iniciando nuevo container con imagen actualizada..."
docker run -d \
    --name $SERVICE_NAME \
    -e PCODE="${PCODE}" \
    -e KEY="${KEY}" \
    -e PORT="${PORT:-443}" \
    -v whatsapp_data:/data/whatsapp-server \
    -p ${PORT:-443}:443 \
    --restart always \
    --label "com.easypanel.managed=true" \
    $IMAGE_NAME

# Verificar estado
sleep 5
if docker ps | grep -q $SERVICE_NAME; then
    echo "✅ Redeploy completado exitosamente!"
    echo "📊 Estado del servicio:"
    docker ps | grep $SERVICE_NAME
else
    echo "❌ Error en el redeploy. Verificando logs..."
    docker logs $SERVICE_NAME --tail 20
fi