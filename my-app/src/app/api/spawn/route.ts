import { ContainerInstanceManagementClient } from "@azure/arm-containerinstance";
import { DefaultAzureCredential } from "@azure/identity";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Ces variables viendront de l'environnement (définies par Terraform plus tard)
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP!;
    const location = "westeurope";

    // 1. Authentification (Locale = az login, Cloud = Managed Identity)
    const credential = new DefaultAzureCredential();
    const client = new ContainerInstanceManagementClient(
      credential,
      subscriptionId
    );

    // 2. Configuration du conteneur à lancer
    const containerGroupName = `challenge-${Math.floor(Math.random() * 1000)}`;

    console.log(`Lancement de ${containerGroupName}...`);

    const result = await client.containerGroups.beginCreateOrUpdate(
      resourceGroup,
      containerGroupName,
      {
        location: location,
        osType: "Linux",
        restartPolicy: "Never", // Important pour un challenge unique
        ipAddress: {
          type: "Public",
          ports: [{ protocol: "TCP", port: 80 }],
        },
        containers: [
          {
            name: "nginx-test",
            image: "mcr.microsoft.com/azuredocs/aci-helloworld",
            resources: { requests: { cpu: 1.0, memoryInGB: 1.5 } },
            ports: [{ port: 80 }],
          },
        ],
      }
    );

    return NextResponse.json({
      success: true,
      message: "Container launching",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Erreur Azure:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
