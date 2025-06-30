import { Output, Services } from "~templates-utils";
import { Input } from "./meta"; // Importa la definición de nuestros campos

export function generate(input: Input): Output {
  const services: Services = [];

  // Servicio de WhatsApp Server
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName || "whatsapp-server", // nombre identificador del servicio
      env: [
        `PCODE=${input.pcode}`,
        `KEY=${input.licenseKey}`,
        `PORT=${input.port || 443}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ubuntu:22.04",
      },
      // Comando de despliegue: instala dependencias y configura un cron para mantener el servicio activo
      deploy: {
        command:
          `sh -c "apt-get update && apt-get install -y wget unzip cron && ` +
          `mkdir -p /app/data/whatsapp-server && cd /app/data/whatsapp-server && ` +
          `wget --no-cache https://raw.anycdn.link/wa/linux.zip && ` +
          `unzip -o linux.zip && chmod +x titansys-whatsapp-linux && rm linux.zip && ` +
          `cat <<'EOF' > /usr/local/bin/run-whatsapp.sh\n` +
          `#!/bin/bash\n` +
          `cd /app/data/whatsapp-server\n` +
          `if ! pgrep -f titansys-whatsapp-linux > /dev/null; then\n` +
          `  ./titansys-whatsapp-linux --pcode=\$PCODE --key=\$KEY --host=0.0.0.0 --port=\$PORT &\n` +
          `fi\n` +
          `EOF && chmod +x /usr/local/bin/run-whatsapp.sh && ` +
          `(crontab -l 2>/dev/null; echo "* * * * * /usr/local/bin/run-whatsapp.sh") | crontab - && ` +
          `cron && sleep infinity"`,
          `sh -c "apt-get update && apt-get install -y wget unzip && ` +
          `wget --no-cache https://raw.anycdn.link/wa/linux.zip && ` +
          `unzip -o linux.zip && chmod -R 777 . && chmod +x ./titansys-whatsapp-linux && rm linux.zip && ` +
          `exec ./titansys-whatsapp-linux --pcode=$PCODE --key=$KEY --host=0.0.0.0 --port=$PORT"`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: input.port || 443,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data/whatsapp-server",
        },
      ],
      // Publicar el puerto para acceso externo o desde la app Zender
      ports: [
        {
          published: input.port || 443, // puerto host (por defecto 443)
          target: input.port || 443, // puerto contenedor donde escucha la app
        },
      ],
    },
  });

  return { services };
}
