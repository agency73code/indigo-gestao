-- CreateTable
CREATE TABLE `auth_refresh_token` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userType` ENUM('terapeuta', 'cliente') NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `deviceName` VARCHAR(255) NULL,
    `ip` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `auth_refresh_token_userId_userType_idx`(`userId`, `userType`),
    INDEX `auth_refresh_token_expiresAt_idx`(`expiresAt`),
    INDEX `auth_refresh_token_revokedAt_idx`(`revokedAt`),
    UNIQUE INDEX `auth_refresh_token_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
