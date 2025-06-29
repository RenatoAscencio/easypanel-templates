import { createTemplate, Service } from "@easypanel/sdk";

export default createTemplate(({ formData }) => {
  const { pcode, licenseKey, port = 443 } = formData;

  const service: Service = {
    name: "zender-wa-server",
    image: "ubuntu:22.04",
    restart: "always",
    entrypoint: ["sh", "-c"],
    env: {
      PCODE: pcode,
      LICENSE_KEY: licenseKey,
      PORT: port.toString(),
    },
    command: [
      `\
      # 1) Actualizar sistema e instalar dependencias\
      apt-get update -y && apt-get upgrade -y && apt-get install -y wget curl unzip nano jq ca-certificates libglib2.0-0 cron && \
      # 2) Crear directorio de datos y montar volumen\
      mkdir -p /app/data/whatsapp-server && cd /app/data/whatsapp-server && \
      # 3) Descargar y preparar binario\
      wget --no-cache https://raw.anycdn.link/wa/linux.zip && unzip -o linux.zip && chmod +x titansys-whatsapp-linux && rm linux.zip && \
      # 4) Crear script de arranque en background\
      cat << 'EOF' > /usr/local/bin/run-whatsapp.sh\
      #!/bin/bash\
      cd /app/data/whatsapp-server\
      if ! pgrep -x "titansys-whatsapp-linux" > /dev/null; then\
        ./titansys-whatsapp-linux --pcode="$PCODE" --key="$LICENSE_KEY" --host="0.0.0.0" --port="$PORT" &\
      fi\
      EOF && chmod +x /usr/local/bin/run-whatsapp.sh && \
      # 5) Programar crontab para asegurar ejecución continua\
      (crontab -l 2>/dev/null; echo "* * * * * /usr/local/bin/run-whatsapp.sh") | crontab - && \
      # 6) Iniciar cron en primer plano\
      cron -f`
    ],
    ports: [
      { protocol: "tcp", published: port, target: port }
    ],
    volumes: [
      { type: "volume", source: "zender-wa-data", target: "/app/data/whatsapp-server" }
    ],
    healthcheck: {
      test: ["CMD-SHELL", `curl -f http://localhost:$PORT || exit 1`],
      interval: 30,
      timeout: 10,
      retries: 3
    }
  };

  return { services: [service] };
});