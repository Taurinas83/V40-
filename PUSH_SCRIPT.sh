#!/bin/bash
# Script para fazer push dos 3 commits do local brain para GitHub

set -e

echo "🚀 Iniciando push dos commits do local brain..."
echo "Branch: claude/analyze-v40-app-QCnT3"
echo "Commits: 217b552 + ff368e1 + d48b263"
echo ""

# 1. Verificar status
echo "✓ Verificando status do git..."
git status
echo ""

# 2. Tentar push com git CLI padrão
echo "✓ Tentando push via git push..."
git push -u origin claude/analyze-v40-app-QCnT3

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCESSO! Branch enviado para GitHub"
  echo "Próximo passo: Criar PR em https://github.com/Taurinas83/V40-"
  echo ""
  echo "Comandos úteis:"
  echo "  git log origin/claude/analyze-v40-app-QCnT3 -3     # Ver commits no remoto"
  echo "  git branch -vv                                     # Ver branch tracking"
else
  echo ""
  echo "❌ Push falhou."
  echo ""
  echo "Alternativas:"
  echo "  1. Criar Personal Access Token em https://github.com/settings/tokens"
  echo "  2. Usar git credential helper:"
  echo "     git config credential.helper store"
  echo "     git push -u origin claude/analyze-v40-app-QCnT3"
  echo ""
  echo "  3. Ou fazer push via HTTPS com token:"
  echo "     git push https://SEU_USERNAME:SEU_TOKEN@github.com/Taurinas83/V40-.git claude/analyze-v40-app-QCnT3"
fi
