import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.estadoReporte.createMany({
    data: [{ nombre: "Pendiente" }, { nombre: "En proceso" }, { nombre: "Resuelto" }],
    skipDuplicates: true,
  });
  await prisma.categoria.createMany({
    data: [
      { nombre: "Hueco en pista", icono: "traffic-cone" },
      { nombre: "Alumbrado", icono: "bulb" },
      { nombre: "Basura", icono: "trash" },
      { nombre: "Semaforo", icono: "traffic-lights" },
      { nombre: "Otro", icono: "alert-triangle" },
    ],
    skipDuplicates: true,
  });
  await prisma.zona.createMany({
    data: [{ nombre: "San Isidro" }, { nombre: "Miraflores" }, { nombre: "Surco" }, { nombre: "Centro" }],
    skipDuplicates: true,
  });
  const usuario = await prisma.usuario.upsert({
    where: { correo: "demo@alertaciudad.pe" },
    update: {},
    create: { nombre: "Usuario Demo", correo: "demo@alertaciudad.pe" },
  });
  await prisma.administrador.upsert({
    where: { correo: "admin@alertaciudad.pe" },
    update: {},
    create: { nombre: "Administrador", correo: "admin@alertaciudad.pe", passwordHash: "cambia_esto" },
  });
  const pendiente = await prisma.estadoReporte.findUnique({ where: { nombre: "Pendiente" } });
  const cat = await prisma.categoria.findFirst();
  const zona = await prisma.zona.findFirst();
  if (pendiente && cat && zona) {
    await prisma.reporte.create({
      data: {
        titulo: "Hueco en la pista", descripcion: "Hueco grande frente al parque",
        lat: -12.097, lng: -77.036, categoriaId: cat.id, zonaId: zona.id,
        estadoId: pendiente.id, usuarioId: usuario.id,
      },
    });
  }
}
main().finally(() => prisma.$disconnect());
