import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName || "whatsapp-server",
      env: [
        `PCODE=${input.pcode}`,
        `KEY=${input.licenseKey}`,
        `PORT=${input.port || 443}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.image || "renatoascencio/zender-wa:v2.1.3",
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
          mountPath: "/data/whatsapp-server",
        },
      ],
      ports: [
        {
          published: input.port || 443,
          target: input.port || 443,
        },
      ],
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: true,
      },
    },
  });

  return { services };
}
