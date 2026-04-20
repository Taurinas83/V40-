#!/bin/bash

# Script para fazer push dos 4 commits para GitHub

echo "🔧 Script de Push para GitHub"
echo "================================"
echo ""

# Verificar commits pendentes
echo "📋 Commits a fazer push:"
git log --oneline origin/claude/analyze-v40-app-QCnT3..HEAD 2>/dev/null | head -10 || git log --oneline | head -5

echo ""
echo "Escolha uma opção:"
echo ""
echo "1) SSH (recomendado - mais seguro)"
echo "2) HTTPS com token (rápido)"
echo "3) Tentar push padrão"
echo ""
read -p "Digite a opção (1-3): " opcao

case $opcao in
  1)
    echo ""
    echo "🔐 Usando SSH..."
    echo ""
    echo "Passos:"
    echo "1. Gerar chave SSH (se não tiver):"
    echo "   ssh-keygen -t ed25519 -C 'seu-email@example.com'"
    echo ""
    echo "2. Adicionar em GitHub → Settings → SSH Keys"
    echo ""
    echo "3. Configurar remoto:"
    git remote set-url origin git@github.com:taurinas83/v40-.git
    echo "   ✅ Remoto configurado para SSH"
    echo ""
    echo "4. Fazer push:"
    git push -u origin claude/analyze-v40-app-QCnT3
    ;;

  2)
    echo ""
    echo "🔑 Usando HTTPS com Token..."
    echo ""
    echo "Passos:"
    echo "1. Gerar token em: https://github.com/settings/tokens"
    echo "   - Marque: repo (full control of private repositories)"
    echo "   - Copie o token"
    echo ""
    read -p "Cole seu GitHub Personal Access Token: " token
    echo ""

    if [ -z "$token" ]; then
      echo "❌ Token vazio. Abortando."
      exit 1
    fi

    echo "Fazendo push com token..."
    git push -u https://${token}@github.com/taurinas83/v40-.git claude/analyze-v40-app-QCnT3

    if [ $? -eq 0 ]; then
      echo "✅ Push bem-sucedido!"
    else
      echo "❌ Push falhou"
      exit 1
    fi
    ;;

  3)
    echo ""
    echo "📤 Tentando push padrão..."
    git push -u origin claude/analyze-v40-app-QCnT3

    if [ $? -eq 0 ]; then
      echo "✅ Push bem-sucedido!"
    else
      echo "⚠️ Push falhou. Tente com SSH ou Token."
      exit 1
    fi
    ;;

  *)
    echo "❌ Opção inválida"
    exit 1
    ;;
esac

echo ""
echo "================================"
echo "Verificando status..."
git status
echo ""
echo "✅ Concluído!"
