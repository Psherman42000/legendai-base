# Legenda Automática MVP - Design

## Objetivo

Construir um MVP funcional para gerar legendas sincronizadas a partir de vídeo enviado pelo usuário.

Fluxo principal:

1. Usuário faz upload de vídeo.
2. Backend valida o arquivo e normaliza mídia com `ffmpeg` quando necessário.
3. Sistema extrai áudio.
4. Sistema transcreve áudio com timestamps.
5. Sistema quebra texto em frases curtas.
6. Usuário visualiza preview simples.
7. Usuário baixa `SRT`.

Escopo do MVP:

- Upload de vídeo em formatos comuns.
- Conversão automática para formato interno quando o arquivo original não for `mp4`.
- Transcrição automática.
- Geração de legenda sincronizada em `SRT`.
- Preview simples da legenda gerada.
- Download do arquivo `SRT`.

Fora do MVP:

- Login.
- Dashboard.
- Multi estilo.
- Karaoke palavra por palavra.
- Efeitos visuais avançados.
- Edição colaborativa.
- Download de vídeo queimado com legenda, salvo se sobrar tempo depois do fluxo `SRT`.

## Requisitos de Produto

### Formatos aceitos

O upload deve aceitar os formatos mais comuns de vídeo, incluindo:

- `mp4`
- `m4v`
- `mov`
- `mkv`
- `webm`
- `avi`

O sistema não deve depender do usuário converter o arquivo antes do upload. Se o contêiner ou codec original não for ideal para o pipeline, o backend deve tentar normalizar o arquivo com `ffmpeg`.

### Comportamento de conversão

- Primeiro, o backend tenta extrair áudio diretamente do arquivo enviado.
- Se a extração direta falhar por causa de contêiner ou codec, o sistema converte o vídeo para `mp4` interno e repete a extração.
- Se ainda assim não for possível processar, o app retorna erro claro dizendo que o vídeo é inválido, corrompido ou incompatível.

### Transcrição

O sistema precisa produzir transcrição com timestamps suficientes para gerar legendas sincronizadas.

Para o MVP, a prioridade é confiabilidade e simplicidade. A implementação deve permitir trocar o motor de transcrição sem mudar o fluxo principal.

### Legenda

- As legendas devem ser quebradas em frases curtas.
- Deve existir apenas 1 estilo de legenda no MVP.
- O sistema deve gerar `SRT` como saída principal.

## Arquitetura

### Stack sugerido

- Frontend: `Next.js`
- API: `Next.js` route handlers ou server actions leves, desde que upload e status fiquem claros
- Fila: `Redis` + `BullMQ`
- Worker: `Node.js`
- Mídia: `ffmpeg`
- Transcrição: `OpenAI audio transcription API`
- Storage temporário: disco local ou bucket simples, desde que com expiração

Motivo:

- reduz número de serviços
- mantém caminho curto para MVP
- separa upload HTTP de processamento pesado

### Frontend

Aplicação web simples, com uma tela principal contendo:

- campo de upload
- estado do processamento
- preview do texto segmentado
- botão de download do `SRT`

Frontend não deve conter lógica pesada de mídia.

### Backend API

Responsável por:

- receber upload
- salvar arquivo temporário
- validar tipo e tamanho
- enfileirar processamento
- expor status do job
- expor resultado final

### Worker de mídia

Responsável por:

- normalizar o arquivo com `ffmpeg`
- extrair áudio
- executar transcrição
- segmentar texto em frases curtas
- gerar `SRT`
- persistir resultado temporário

### Motor de transcrição

O MVP deve usar uma única integração de transcrição, via `OpenAI audio transcription API`, encapsulada por uma camada própria.

Motivo:

- entrega rápida
- timestamps confiáveis
- facilita troca futura sem reescrever o fluxo

Se o provedor mudar depois, só a camada de transcrição troca.

### Armazenamento temporário

Usar storage temporário para:

- arquivo original
- arquivo normalizado
- áudio extraído
- resultado da transcrição
- `SRT` final

Os artefatos podem expirar depois de um período curto. O MVP não precisa de retenção longa.

## Fluxo de Dados

1. Usuário envia vídeo.
2. API grava upload em storage temporário.
3. API cria job de processamento.
4. Worker tenta extrair áudio.
5. Se necessário, worker converte vídeo para `mp4` e tenta novamente.
6. Worker transcreve áudio com timestamps.
7. Worker gera segmentos curtos.
8. Worker monta `SRT`.
9. Frontend consulta status do job.
10. Quando pronto, usuário vê preview e baixa o `SRT`.

## Decisões Técnicas

### Conversão de vídeo

`ffmpeg` será usado como camada padrão de normalização.

Motivo:

- cobre muitos formatos conhecidos
- reduz erro de compatibilidade
- evita exigir que usuário entregue apenas `mp4`

### Processamento assíncrono

O processamento de mídia deve ser assíncrono.

Motivo:

- vídeos podem ser grandes
- transcrição e conversão podem levar tempo
- evita travar request HTTP

### Segmentação de fala

A segmentação em frases curtas deve acontecer depois da transcrição.

Motivo:

- simplifica o motor de transcrição
- permite ajustar regra de quebra sem refazer pipeline inteiro

## Erros e Resiliência

### Casos esperados

- upload sem vídeo
- arquivo corrompido
- formato não suportado por `ffmpeg`
- falha de conversão
- falha de transcrição
- job expirado antes do download

### Regras de erro

- Cada job deve ter status explícito: `queued`, `processing`, `done`, `error`.
- Mensagem de erro deve ser legível para usuário, sem stack trace.
- Falhas de conversão não devem marcar o sistema inteiro como indisponível.

### Recuperação

- Se a extração direta falhar, tentar conversão.
- Se transcrição falhar, registrar erro do job e permitir novo envio.
- Se o arquivo temporário expirar, orientar usuário a reenviar.

## Preview

Preview do MVP deve ser simples:

- lista de blocos de legenda
- timestamps visíveis
- texto editável opcional, se isso não atrasar o núcleo do fluxo

Se a edição atrasar a entrega, o MVP pode começar só com preview de leitura.

## Testes

### Backend

- aceitar formatos comuns de vídeo
- converter arquivos não-`mp4` via `ffmpeg`
- extrair áudio com sucesso em arquivos válidos
- falhar com erro claro em arquivo corrompido
- gerar `SRT` com timestamps válidos

### Fluxo

- upload -> processamento -> preview -> download
- timeout e erro de job

### Contratos

- status do job deve ser estável
- arquivo `SRT` deve respeitar formato padrão

## Critério de Sucesso

O MVP é bem-sucedido se o usuário conseguir:

- enviar um vídeo em formato comum
- aguardar o processamento
- receber legendas sincronizadas
- baixar um `SRT` funcional

O app deve aceitar formatos além de `mp4` sem exigir conversão manual.
