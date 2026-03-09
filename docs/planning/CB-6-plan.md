# Plano Técnico - CB-6: Gerenciar Versões na Sessão

## Arquitetura da Solução
A solução utilizará o Redis (via Upstash) para persistência temporária das versões dos componentes gerados, associadas a um `session_id` único armazenado nos cookies do navegador. Isso permite que usuários anônimos mantenham um histórico de suas gerações durante a sessão.

### Fluxo de Dados
1. **Identificação:** Um middleware ou hook de cliente verifica a existência de um `session_id` no cookie. Se não existir, gera um UUID.
2. **Armazenamento:** Ao gerar um novo componente, a API `POST /api/generate` salvará o código no Redis sob a chave `session:[session_id]:versions`.
3. **Limite e TTL:** O Redis gerenciará o TTL de 24h. A aplicação garantirá que apenas as últimas 5 versões sejam mantidas usando `LPUSH` e `LTRIM`.
4. **Recuperação:** Uma nova API `GET /api/versions` retornará a lista de versões para exibição na UI.

## Arquivos a Criar/Modificar
- `src/lib/redis.ts` - (Se não existir) Configuração do cliente Redis.
- `src/app/api/versions/route.ts` - Novo endpoint para listar versões.
- `src/app/api/generate/route.ts` - Modificar para salvar a versão gerada no Redis.
- `src/app/page.tsx` - Integrar a exibição do histórico de versões.
- `src/middleware.ts` - (Opcional) Para garantir o `session_id` em todas as requisições.

## Dependências
- `uuid` - Para geração de IDs únicos.
- `@upstash/redis` - Já instalado.

## Passo a Passo
1. **Gerenciamento de Sessão:**
   - Implementar lógica de cookies para `session_id`.
2. **Integração com Redis:**
   - Criar helper para salvar versão: `saveVersion(sessionId, code)`.
   - Usar `LPUSH` para adicionar ao início e `LTRIM` para manter apenas 5 itens.
   - Definir `EXPIRE` para 24 horas.
3. **Endpoints de API:**
   - Criar `GET /api/versions` que retorna a lista do Redis.
   - Atualizar `POST /api/generate` para chamar `saveVersion`.
4. **Interface (UI):**
   - Adicionar uma barra lateral ou seção de "Histórico" no Studio.
   - Permitir que o usuário clique em uma versão anterior para restaurar o código no editor/preview.

## Riscos e Mitigações
- **Concorrência:** O uso de operações atômicas do Redis (`LPUSH`, `LTRIM`) mitiga problemas de concorrência.
- **Privacidade:** Como são sessões anônimas e temporárias, o risco de exposição de dados sensíveis é baixo, mas o `session_id` deve ser tratado com segurança mínima (HttpOnly se possível).
