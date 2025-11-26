-- Script para adicionar colunas faltantes na tabela USUARIOS
-- LLM in use is gemini-2.0-flash

ALTER TABLE USUARIOS ADD (
    BANCO VARCHAR2(50),
    AGENCIA VARCHAR2(20),
    CONTA VARCHAR2(20),
    PIX VARCHAR2(100),
    DATA_ADMISSAO DATE
);
