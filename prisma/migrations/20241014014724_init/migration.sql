-- AlterTable
ALTER TABLE `usuarios` ALTER COLUMN `rol` DROP DEFAULT,
    ALTER COLUMN `foto_perfil` DROP DEFAULT;

-- CreateTable
CREATE TABLE `publicaciones` (
    `id_publicacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_tipo` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `resumen` TEXT NOT NULL,
    `contenido` TEXT NOT NULL,
    `estado` ENUM('borrador', 'en_revision', 'publicado', 'rechazado') NOT NULL,
    `imagen_portada` VARCHAR(191) NULL,
    `es_privada` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_publicacion` DATETIME(3) NULL,
    `eliminado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_eliminacion` DATETIME(3) NULL,

    INDEX `publicaciones_estado_idx`(`estado`),
    INDEX `publicaciones_fecha_publicacion_idx`(`fecha_publicacion`),
    PRIMARY KEY (`id_publicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_publicacion` (
    `id_tipo` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,

    PRIMARY KEY (`id_tipo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios` (
    `id_comentario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_publicacion` INTEGER NOT NULL,
    `contenido` TEXT NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comentarios_id_publicacion_idx`(`id_publicacion`),
    PRIMARY KEY (`id_comentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios_revision` (
    `id_comentario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_revision` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `contenido` TEXT NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_comentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoritos` (
    `id_favorito` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_publicacion` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favoritos_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_favorito`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `multimedia_publicacion` (
    `id_imagen` INTEGER NOT NULL AUTO_INCREMENT,
    `id_publicacion` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_imagen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id_notificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `contenido` VARCHAR(191) NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `notificar_correo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificaciones_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_notificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revisiones` (
    `id_revision` INTEGER NOT NULL AUTO_INCREMENT,
    `id_publicacion` INTEGER NOT NULL,
    `id_revisor` INTEGER NOT NULL,
    `aprobado` BOOLEAN NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_tipo_revision` INTEGER NULL,

    INDEX `revisiones_id_publicacion_idx`(`id_publicacion`),
    PRIMARY KEY (`id_revision`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_revision` (
    `id_tipo_revision` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_revision` VARCHAR(191) NOT NULL,
    `descripcion_revision` VARCHAR(191) NULL,

    PRIMARY KEY (`id_tipo_revision`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bitacora_estudio` (
    `id_bitacora` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_publicacion` INTEGER NOT NULL,
    `notas` TEXT NULL,
    `titulo_publicacion` VARCHAR(191) NULL,
    `contenido_extracto` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_bitacora`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `publicaciones` ADD CONSTRAINT `publicaciones_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `publicaciones` ADD CONSTRAINT `publicaciones_id_tipo_fkey` FOREIGN KEY (`id_tipo`) REFERENCES `tipos_publicacion`(`id_tipo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_id_publicacion_fkey` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones`(`id_publicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios_revision` ADD CONSTRAINT `comentarios_revision_id_revision_fkey` FOREIGN KEY (`id_revision`) REFERENCES `revisiones`(`id_revision`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios_revision` ADD CONSTRAINT `comentarios_revision_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_id_publicacion_fkey` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones`(`id_publicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `multimedia_publicacion` ADD CONSTRAINT `multimedia_publicacion_id_publicacion_fkey` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones`(`id_publicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisiones` ADD CONSTRAINT `revisiones_id_publicacion_fkey` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones`(`id_publicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisiones` ADD CONSTRAINT `revisiones_id_revisor_fkey` FOREIGN KEY (`id_revisor`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisiones` ADD CONSTRAINT `revisiones_id_tipo_revision_fkey` FOREIGN KEY (`id_tipo_revision`) REFERENCES `tipo_revision`(`id_tipo_revision`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bitacora_estudio` ADD CONSTRAINT `bitacora_estudio_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bitacora_estudio` ADD CONSTRAINT `bitacora_estudio_id_publicacion_fkey` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones`(`id_publicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;
