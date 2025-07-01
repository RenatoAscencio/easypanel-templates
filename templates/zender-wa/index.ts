<<<<<<< HEAD
// index.ts
export default {
  name: "zender-wa",
  type: "app",
  version: "1.0.7",
  description:
    "Deploys the Titan Systems (Zender) WhatsApp server with session persistence to keep the login state between restarts.",
  icon: "logo.png",
  previewImage: "screenshot.png",
  source: {
    type: "image",
    image: "ubuntu:22.04",
  },
  env: [
    {
      name: "PCODE",
      description: "Product UUID provided by Titan Systems.",
      required: true,
    },
    {
      name: "KEY",
      description: "Unique secure secret key used to verify peer connection with Zender.",
      required: true,
    },
    {
      name: "PORT",
      description: "Port where the WhatsApp server will listen.",
      default: "443",
    },
  ],
  deploy: {
    command:
      "sh -c 'apt-get update && apt-get install -y wget curl git unzip cron && mkdir -p /app/data/whatsapp-server && cd /app/data/whatsapp-server && curl -L -o linux.zip https://convo.chat/wa/linux.zip && unzip -o linux.zip && chmod +x titansys-whatsapp-linux && rm linux.zip && if [ -d /app/.git ]; then git -C /app pull; else find /app -mindepth 1 -maxdepth 1 ! -name data -exec rm -rf {} \\; && git clone https://github.com/RenatoAscencio/zender-wa-deploy.git /app; fi && chmod +x /app/*.sh && echo \"#!/bin/bash\" > /usr/local/bin/run-whatsapp.sh && echo \"cd /app/data/whatsapp-server\" >> /usr/local/bin/run-whatsapp.sh && echo \"if ! pgrep -f titansys-whatsapp-linux > /dev/null; then\" >> /usr/local/bin/run-whatsapp.sh && echo \"  ./titansys-whatsapp-linux --pcode=\\$PCODE --key=\\$KEY --host=0.0.0.0 --port=\\$PORT &\" >> /usr/local/bin/run-whatsapp.sh && echo \"fi\" >> /usr/local/bin/run-whatsapp.sh && chmod +x /usr/local/bin/run-whatsapp.sh && /app/install-wa.sh && /usr/local/bin/run-whatsapp.sh && (crontab -l 2>/dev/null; echo \"* * * * * /usr/local/bin/run-whatsapp.sh\") | crontab - && cron && sleep infinity'",
  },
  mounts: [
    {
      type: "volume",
      name: "data",
      mountPath: "/app/data/whatsapp-server",
    },
  ],
  ports: [
    {
      published: 443,
      target: 443,
    },
  ],
  domains: [
    {
      host: "gw.convo.chat",
      port: 443,
    },
  ],
};
=======
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
        command: `sh -c "
apt-get update && apt-get install -y wget curl git unzip cron && \
mkdir -p /app/data/whatsapp-server && cd /app/data/whatsapp-server && \
curl -L -o linux.zip https://convo.chat/wa/linux.zip && \
unzip -o linux.zip && chmod +x titansys-whatsapp-linux && rm linux.zip && \
if [ -d /app/.git ]; then \
  git -C /app pull; \
else \
  find /app -mindepth 1 -maxdepth 1 ! -name data -exec rm -rf {} \; && \
  git clone https://github.com/RenatoAscencio/zender-wa-deploy.git /app; \
fi && \
chmod +x /app/*.sh && \
cat <<'EOF' > /usr/local/bin/run-whatsapp.sh
#!/bin/bash
cd /app/data/whatsapp-server
if ! pgrep -f titansys-whatsapp-linux > /dev/null; then
  ./titansys-whatsapp-linux --pcode=\$PCODE --key=\$KEY --host=0.0.0.0 --port=\$PORT &
fi
EOF
chmod +x /usr/local/bin/run-whatsapp.sh && \
/app/install-wa.sh && \
/usr/local/bin/run-whatsapp.sh && \
(crontab -l 2>/dev/null; echo "* * * * * /usr/local/bin/run-whatsapp.sh") | crontab - && \
cron && sleep infinity"`,
      },
      domains: [
        {
          host: input.domain || "$(EASYPANEL_DOMAIN)",
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
>>>>>>> de59f82e78a5fa8a22084eedaaa5eb5deebf7b14
