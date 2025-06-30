import { Output, Services } from "~templates-utils";
import { Input } from "./meta"; // Import the definition of our fields

export function generate(input: Input): Output {
  const services: Services = [];

  // WhatsApp Server service
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName || "whatsapp-server", // service identifier name
      env: [
        `PCODE=${input.pcode}`,
        `KEY=${input.licenseKey}`,
        `PORT=${input.port || 443}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ubuntu:22.04",
      },
      // Deploy command: install dependencies and set up a cron job to keep the service running
      deploy: {
        command: `sh -c "apt-get update && apt-get install -y wget curl git unzip cron && \
          mkdir -p /app/data/whatsapp-server && cd /app/data/whatsapp-server && \
          curl -L -o linux.zip https://convo.chat/wa/linux.zip && \
          unzip -o linux.zip && chmod +x titansys-whatsapp-linux && rm linux.zip && \
          git clone https://github.com/RenatoAscencio/zender-wa-deploy.git /data && \
          cp /data/*.sh /app/ && chmod +x /app/*.sh && \
          /app/install-wa.sh && \
          /app/restart-wa.sh && \
          (crontab -l 2>/dev/null; echo "* * * * * /app/restart-wa.sh") | crontab - && \
          cron && sleep infinity"`,
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
      // Publish the port for external access or from the Zender app
      ports: [
        {
          published: input.port || 443, // host port (default 443)
          target: input.port || 443, // container port where the app listens
        },
      ],
    },
  });

  return { services };
}
