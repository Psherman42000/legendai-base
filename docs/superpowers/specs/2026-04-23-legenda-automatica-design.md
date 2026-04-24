# Legenda Automatica MVP - Design

## Objetivo

Construir um MVP funcional para gerar legendas sincronizadas a partir de video enviado pelo usuario, sem custo de infra alem do plano gratis da Vercel.

Fluxo principal:

1. Usuario faz upload de video.
2. App roda conversao e extracao localmente no navegador.
3. App transcreve audio com timestamps.
4. App quebra texto em frases curtas.
5. Usuario visualiza preview simples.
6. Usuario baixa `SRT`.

Escopo do MVP:

- Upload de video em formatos comuns.
- Conversao automatica para formato interno quando o arquivo original nao for `mp4`.
- Transcricao automatica sem API paga.
- Geracao de legenda sincronizada em `SRT`.
- Preview simples da legenda gerada.
- Download do arquivo `SRT`.

Fora do MVP:

- Login.
- Dashboard.
- Multi estilo.
- Karaoke palavra por palavra.
- Efeitos visuais avancados.
- Edicao colaborativa.
- Download de video queimado com legenda.

## Requisitos de Produto

### Formatos aceitos

O upload deve aceitar os formatos mais comuns de video, incluindo:

- `mp4`
- `m4v`
- `mov`
- `mkv`
- `webm`
- `avi`

O sistema nao deve depender do usuario converter o arquivo antes do upload. Se o container ou codec original nao for ideal para o pipeline, o app deve tentar normalizar o arquivo no navegador.

### Comportamento de conversao

- Primeiro, o app tenta extrair audio diretamente do arquivo enviado.
- Se a extracao direta falhar por causa de container ou codec, o app converte o video para `mp4` interno e repete a extracao.
- Se ainda assim nao for possivel processar, o app retorna erro claro dizendo que o video e invalido, corrompido ou incompativel.

### Transcricao

O sistema precisa produzir transcricao com timestamps suficientes para gerar legendas sincronizadas.

Para o MVP gratuito, a prioridade e confiabilidade e simplicidade. A implementacao deve usar um modelo Whisper pequeno em JavaScript/WASM e permitir trocar o modelo sem mudar o fluxo principal.

### Legenda

- As legendas devem ser quebradas em frases curtas.
- Deve existir apenas 1 estilo de legenda no MVP.
- O sistema deve gerar `SRT` como saida principal.

## Arquitetura

### Stack sugerido

- Frontend: `Next.js`
- Hosting: `Vercel Hobby`
- Midia: `ffmpeg.wasm`
- Transcricao: `Transformers.js` com um modelo Whisper pequeno
- Storage: somente navegador, sem backend de arquivos
- Backend: nao usar no MVP gratuito

Motivo:

- custo zero
- cabe no uso gratuito da Vercel
- evita API paga e servidor de midia
- mantem o produto funcional sem infra extra

### Frontend

Aplicacao web simples, com uma tela principal contendo:

- campo de upload
- estado do processamento
- preview do texto segmentado
- botao de download do `SRT`

Frontend nao deve conter logica pesada de midia, mas deve orquestrar o processamento local e mostrar progresso.

### Backend API

Nao entra no MVP gratuito.

Motivo:

- nao ha budget para worker nem fila gerenciada
- processamento pesado em backend nao combina com Vercel free para videos
- o fluxo pode ser feito inteiro no navegador

### Worker de midia

Nao entra no MVP gratuito.

Responsavel por:

- normalizar o arquivo com `ffmpeg.wasm`
- extrair audio
- executar transcricao local
- segmentar texto em frases curtas
- gerar `SRT`
- manter resultado em memoria ou `Blob` ate download

### Motor de transcricao

O MVP deve usar uma unica integracao de transcricao local, via `Transformers.js` com Whisper pequeno, encapsulada por uma camada propria.

Motivo:

- custo zero
- roda no navegador
- facilita troca futura sem reescrever o fluxo

Se o modelo mudar depois, so a camada de transcricao troca.

### Armazenamento temporario

Nao usar storage externo no MVP gratuito.

Usar apenas:

- memoria da pagina
- `File`/`Blob`
- `URL.createObjectURL` para preview e download

Os artefatos podem desaparecer quando a aba fechar.

## Fluxo de Dados

1. Usuario envia video.
2. App le arquivo direto no navegador.
3. `ffmpeg.wasm` tenta extrair audio.
4. Se necessario, `ffmpeg.wasm` converte video para `mp4` e tenta novamente.
5. `Transformers.js` transcreve audio com timestamps.
6. App gera segmentos curtos.
7. App monta `SRT`.
8. Usuario ve preview e baixa o `SRT`.

## Decisoes Tecnicas

### Conversao de video

`ffmpeg.wasm` sera usado como camada padrao de normalizacao.

Motivo:

- cobre muitos formatos conhecidos
- reduz erro de compatibilidade
- evita exigir que usuario entregue apenas `mp4`
- funciona sem servidor pago

### Processamento assincrono

O processamento de midia deve ser assincrono dentro do navegador.

Motivo:

- videos podem ser grandes
- transcricao e conversao podem levar tempo
- evita travar a interface
- nao depende de request HTTP

### Segmentacao de fala

A segmentacao em frases curtas deve acontecer depois da transcricao.

Motivo:

- simplifica o motor de transcricao
- permite ajustar regra de quebra sem refazer o fluxo inteiro

## Erros e Resiliencia

### Casos esperados

- upload sem video
- arquivo corrompido
- formato nao suportado por `ffmpeg.wasm`
- falha de conversao
- falha de transcricao
- aba fechada antes do download

### Regras de erro

- Cada processamento deve ter status explicito: `idle`, `loading-model`, `processing`, `done`, `error`.
- Mensagem de erro deve ser legivel para usuario, sem stack trace.
- Falhas de conversao nao devem quebrar a sessao inteira.

### Recuperacao

- Se a extracao direta falhar, tentar conversao.
- Se transcricao falhar, permitir novo envio.
- Se a aba for fechada, orientar usuario a reenviar.

## Preview

Preview do MVP deve ser simples:

- lista de blocos de legenda
- timestamps visiveis
- texto editavel opcional, se isso nao atrasar o nucleo do fluxo

Se a edicao atrasar a entrega, o MVP pode comecar so com preview de leitura.

## Testes

### Frontend

- aceitar formatos comuns de video
- converter arquivos nao-`mp4` via `ffmpeg.wasm`
- extrair audio com sucesso em arquivos validos
- falhar com erro claro em arquivo corrompido
- gerar `SRT` com timestamps validos

### Fluxo

- upload -> processamento local -> preview -> download
- falha de carregamento de modelo

### Contratos

- status do processamento deve ser estavel
- arquivo `SRT` deve respeitar formato padrao

## Criterio de Sucesso

O MVP e bem-sucedido se o usuario conseguir:

- enviar um video em formato comum
- aguardar o processamento
- receber legendas sincronizadas
- baixar um `SRT` funcional

O app deve aceitar formatos alem de `mp4` sem exigir conversao manual.
O app nao deve depender de servico pago para transcricao ou conversao.
