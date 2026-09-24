# POC de Reconhecimento Facial

Projeto simples de reconhecimento facial executado diretamente no navegador.

O objetivo inicial do projeto é:

* Abrir a câmera do dispositivo.
* Exibir o vídeo da câmera na tela.
* Detectar quando existe um rosto.
* Desenhar um retângulo ao redor do rosto.
* Gerar um **embedding facial**.
* Exibir o status do processamento.
* Mostrar o embedding no console do navegador.

> **Importante:** neste momento o projeto é apenas um POC. Não existe banco de dados, login, backend ou cadastro de pessoas.

---

# 1. Tecnologias utilizadas

O projeto utiliza apenas tecnologias que rodam diretamente no navegador:

* HTML
* CSS
* JavaScript
* `face-api.js`
* API de câmera do navegador (`getUserMedia`)

A biblioteca `face-api.js` é responsável pela parte de inteligência artificial relacionada ao rosto.

---

# 2. Estrutura do projeto

```text
facial-poc/
│
├── index.html
│
├── css/
│   └── style.css
│
└── js/
    ├── ui.js
    ├── camera.js
    ├── face.js
    └── app.js
```

Cada arquivo possui uma responsabilidade específica.

A ideia é evitar colocar todo o código dentro de um único arquivo.

---

# 3. Visão geral da arquitetura

O arquivo `app.js` funciona como o "maestro" do projeto.

Ele conversa com os outros módulos:

```text
                    index.html
                        │
                        ▼
                     app.js
                   /    |    \
                  /     |     \
                 ▼      ▼      ▼
            camera.js face.js ui.js
               │        │       │
               ▼        ▼       ▼
            Câmera    IA facial  Tela
```

De forma simples:

* `camera.js` → cuida da câmera.
* `face.js` → cuida da inteligência artificial.
* `ui.js` → cuida da interface.
* `app.js` → coordena tudo.

---

# 4. index.html

O `index.html` é a página principal do projeto.

Ele contém os elementos que serão exibidos no navegador.

Entre eles:

```html
<video id="video"></video>
```

O elemento `video` mostra a imagem da câmera.

Também temos:

```html
<canvas id="canvas"></canvas>
```

O `canvas` é utilizado para desenhar o retângulo ao redor do rosto detectado.

Também existem:

* área de status;
* botão para iniciar a câmera;
* botão para parar a câmera.

---

## Carregamento dos arquivos JavaScript

O HTML carrega primeiro a biblioteca `face-api.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js"></script>
```

Depois carrega nossos arquivos:

```html
<script src="js/ui.js"></script>
<script src="js/camera.js"></script>
<script src="js/face.js"></script>
<script src="js/app.js"></script>
```

A ordem é importante.

O `app.js` é carregado por último porque ele utiliza os outros módulos.

---

# 5. css/style.css

Esse arquivo é responsável apenas pela aparência da aplicação.

Por exemplo:

* tamanho da câmera;
* posicionamento dos elementos;
* aparência dos botões;
* cores;
* espaçamentos;
* tamanho do canvas.

A ideia é não colocar regras de aparência dentro do JavaScript.

Assim:

```text
HTML → estrutura
CSS  → aparência
JS   → comportamento
```

---

# 6. js/ui.js

O arquivo `ui.js` é responsável pela interface.

Ele não sabe como a câmera funciona e também não sabe como a inteligência artificial funciona.

Ele apenas altera o que o usuário vê.

O módulo é:

```javascript
const UI = {
    ...
};
```

---

## UI.setStatus()

```javascript
UI.setStatus("Câmera ativada");
```

Altera a mensagem apresentada na tela.

Exemplos:

```text
Inicializando...
Câmera ativada
Nenhum rosto detectado
Rosto detectado
Embedding gerado
Câmera parada
```

---

## UI.setCameraRunning()

```javascript
UI.setCameraRunning(true);
```

Controla o estado dos botões.

Quando a câmera está ligada:

```text
[ Iniciar ] desabilitado
[ Parar ]   habilitado
```

Quando está desligada:

```text
[ Iniciar ] habilitado
[ Parar ]   desabilitado
```

---

# 7. js/camera.js

Esse arquivo é responsável exclusivamente pela câmera.

O objeto principal é:

```javascript
const Camera = {
    ...
};
```

Ele possui três funções principais:

```text
Camera.start()
Camera.stop()
Camera.isSupported()
```

---

## Camera.start()

Responsável por solicitar acesso à câmera.

Internamente utiliza:

```javascript
navigator.mediaDevices.getUserMedia()
```

Esse é o recurso do navegador que permite acessar câmera e microfone.

No projeto solicitamos apenas vídeo:

```javascript
audio: false
```

---

## Câmera frontal

Utilizamos:

```javascript
facingMode: {
    ideal: "user"
}
```

Isso informa ao navegador que preferimos a câmera frontal.

É especialmente útil quando o projeto estiver sendo executado em:

* celular;
* tablet;
* notebook com câmera frontal.

---

## Camera.stop()

Responsável por desligar a câmera.

Primeiro recuperamos as faixas da câmera:

```javascript
this.stream.getTracks()
```

Depois paramos cada uma:

```javascript
track.stop()
```

Isso é importante porque simplesmente esconder o vídeo não significa necessariamente desligar a câmera.

---

## Camera.isSupported()

Verifica se o navegador possui suporte à API utilizada:

```javascript
navigator.mediaDevices.getUserMedia
```

Se não houver suporte, o projeto informa:

```text
Câmera não suportada neste navegador
```

---

# 8. js/face.js

Esse é o arquivo responsável pela parte de inteligência artificial.

É aqui que acontece o processamento do rosto.

O objeto principal é:

```javascript
const Face = {
    ...
};
```

As principais funções são:

```text
Face.loadModels()
Face.detect()
Face.getEmbedding()
Face.draw()
Face.clear()
```

---

# 9. Modelos de inteligência artificial

Antes de detectar um rosto, precisamos carregar os modelos.

O projeto utiliza três:

### TinyFaceDetector

Responsável por encontrar o rosto na imagem.

```text
Imagem da câmera
       ↓
TinyFaceDetector
       ↓
Rosto encontrado
```

---

### faceLandmark68Net

Depois que encontramos o rosto, esse modelo identifica pontos importantes da face.

São aproximadamente 68 pontos.

Por exemplo:

```text
olhos
sobrancelhas
nariz
boca
mandíbula
```

Esses pontos ajudam a entender a estrutura do rosto.

---

### faceRecognitionNet

É o modelo responsável por gerar o **descriptor**, também chamado neste projeto de **embedding facial**.

O resultado é um vetor numérico.

Exemplo simplificado:

```text
[
  0.123,
  -0.421,
  0.087,
  0.532,
  ...
]
```

No modelo utilizado, o descriptor possui:

```text
128 valores
```

---

# 10. Face.loadModels()

Essa função carrega os modelos necessários.

```javascript
await faceapi.nets.tinyFaceDetector.loadFromUri(...)
await faceapi.nets.faceLandmark68Net.loadFromUri(...)
await faceapi.nets.faceRecognitionNet.loadFromUri(...)
```

Isso precisa acontecer antes da detecção.

O fluxo é:

```text
Iniciar aplicação
      ↓
Carregar modelos
      ↓
Modelos carregados
      ↓
Aguardar câmera
```

Para evitar carregar os modelos várias vezes, utilizamos:

```javascript
modelsLoaded
```

Depois que os modelos foram carregados, não precisamos carregá-los novamente.

---

# 11. Face.detect()

Essa é uma das funções mais importantes do projeto.

Ela recebe o vídeo da câmera:

```javascript
Face.detect(video)
```

E executa:

```text
Vídeo
  ↓
Detectar rosto
  ↓
Encontrar landmarks
  ↓
Gerar descriptor
  ↓
Retornar resultado
```

Internamente temos:

```javascript
faceapi
    .detectSingleFace(...)
    .withFaceLandmarks()
    .withFaceDescriptor()
```

---

# 12. detectSingleFace()

O método:

```javascript
detectSingleFace()
```

procura um rosto na imagem.

O projeto está configurado para trabalhar com **um rosto por vez**.

Se encontrar:

```text
Rosto encontrado
```

Se não encontrar:

```text
Nenhum rosto
```

---

# 13. Face.getEmbedding()

Depois que o rosto é detectado, podemos pegar o descriptor:

```javascript
detection.descriptor
```

Ele é retornado como um `Float32Array`.

Para facilitar o uso posteriormente, transformamos em um array JavaScript:

```javascript
Array.from(detection.descriptor)
```

O resultado é o embedding facial.

Exemplo:

```text
[
  0.12,
  -0.03,
  0.45,
  ...
]
```

Esse vetor poderá ser utilizado futuramente para comparar rostos.

---

# 14. O que é um embedding facial?

O embedding é uma representação numérica do rosto.

Em vez de armazenar simplesmente:

```text
"João"
```

ou uma foto inteira, temos uma representação matemática da face.

De forma simplificada:

```text
Foto
 ↓
Modelo de IA
 ↓
Embedding
 ↓
[0.12, -0.03, 0.45, ...]
```

Posteriormente podemos comparar dois embeddings para verificar o quanto eles são semelhantes.

Por exemplo:

```text
Embedding A
     ↓
Comparação
     ↑
Embedding B
```

Essa parte será desenvolvida em etapas futuras.

---

# 15. Face.draw()

Essa função desenha o resultado da detecção na tela.

Ela utiliza o:

```javascript
<canvas>
```

Primeiro limpamos o canvas:

```javascript
context.clearRect(...)
```

Depois ajustamos o resultado para o tamanho do vídeo:

```javascript
faceapi.resizeResults(...)
```

Por fim desenhamos a detecção:

```javascript
faceapi.draw.drawDetections(...)
```

O resultado é o retângulo mostrado ao redor do rosto.

---

# 16. Face.clear()

Responsável por limpar o canvas.

É utilizado, por exemplo, quando a câmera é desligada.

Sem essa limpeza, o último retângulo poderia continuar aparecendo na tela.

---

# 17. js/app.js

O `app.js` é o arquivo que coordena o funcionamento da aplicação.

Ele não implementa a câmera nem a inteligência artificial.

Ele simplesmente organiza a execução.

Podemos pensar nele como um maestro:

```text
app.js
  │
  ├── chama Camera
  │
  ├── chama Face
  │
  └── chama UI
```

---

# 18. initialize()

É executado quando a aplicação inicia.

Primeiro verifica se o navegador suporta câmera:

```javascript
Camera.isSupported()
```

Depois carrega os modelos:

```javascript
Face.loadModels()
```

Fluxo:

```text
Página abriu
    ↓
Verifica câmera
    ↓
Carrega modelos
    ↓
Pronto para iniciar
```

---

# 19. startCamera()

Executada quando o usuário clica em:

```text
Iniciar câmera
```

Ela faz várias coisas:

```text
1. Inicia câmera
       ↓
2. Configura canvas
       ↓
3. Atualiza interface
       ↓
4. Inicia detecção facial
```

A câmera é iniciada através de:

```javascript
Camera.start(video)
```

---

# 20. setupCanvas()

Configura o tamanho do canvas de acordo com o vídeo:

```javascript
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
```

Isso é importante porque o canvas precisa acompanhar a resolução real da câmera.

---

# 21. startDetection()

Inicia o processamento contínuo.

Atualmente utilizamos:

```javascript
setInterval(processFace, 150);
```

Isso significa que aproximadamente a cada:

```text
150 ms
```

o sistema tenta detectar um rosto.

Simplificando:

```text
Câmera
   ↓
150 ms
   ↓
Detecta rosto
   ↓
150 ms
   ↓
Detecta novamente
   ↓
...
```

---

# 22. processFace()

Essa é a principal função do processamento.

Ela chama:

```javascript
Face.detect(video)
```

Depois verifica se encontrou um rosto.

### Quando não encontra:

```text
Nenhum rosto detectado
```

### Quando encontra:

```text
Rosto detectado
```

Depois gera o embedding:

```javascript
Face.getEmbedding(detection)
```

E atualmente mostra o resultado no console:

```javascript
console.log(embedding);
```

---

# 23. stopDetection()

Para o processamento contínuo.

Ela cancela o:

```javascript
setInterval()
```

Isso evita que o sistema continue tentando detectar rostos depois que a câmera foi desligada.

---

# 24. stopCamera()

Executada quando o usuário clica em:

```text
Parar câmera
```

Ela:

```text
Para detecção
      ↓
Desliga câmera
      ↓
Limpa canvas
      ↓
Atualiza botões
      ↓
Mostra "Câmera parada"
```

---

# 25. Fluxo completo da aplicação

Quando o usuário abre a página:

```text
index.html
    ↓
app.js
    ↓
initialize()
    ↓
Carrega modelos
```

Depois o usuário clica em **Iniciar**:

```text
startCamera()
    ↓
Camera.start()
    ↓
Câmera ligada
    ↓
startDetection()
```

A partir daí:

```text
Vídeo
  ↓
Face.detect()
  ↓
Existe rosto?
  │
  ├── NÃO → "Nenhum rosto detectado"
  │
  └── SIM
       ↓
    Desenha retângulo
       ↓
    Gera embedding
       ↓
    Mostra no console
```

---

# 26. Por que separar os arquivos?

A separação facilita a manutenção.

Imagine que no futuro precisamos trocar a forma de acessar a câmera.

Provavelmente mexeremos apenas em:

```text
camera.js
```

Se quisermos mudar o modelo de inteligência artificial:

```text
face.js
```

Se quisermos mudar os textos da tela:

```text
ui.js
```

Se quisermos alterar o fluxo da aplicação:

```text
app.js
```

Isso evita transformar o projeto em um único arquivo enorme.

---

# 27. Responsabilidade de cada arquivo

| Arquivo      | Responsabilidade         |
| ------------ | ------------------------ |
| `index.html` | Estrutura da página      |
| `style.css`  | Aparência                |
| `ui.js`      | Interface                |
| `camera.js`  | Câmera                   |
| `face.js`    | Inteligência artificial  |
| `app.js`     | Coordenação da aplicação |

Uma forma fácil de lembrar:

```text
HTML → O que existe na tela?

CSS → Como aparece?

UI → O que o usuário vê?

Camera → Como acessar a câmera?

Face → Como entender o rosto?

App → Como tudo funciona junto?
```

---

# 28. Estado atual do projeto

Neste momento o projeto consegue:

* [x] Abrir câmera
* [x] Preferir câmera frontal
* [x] Exibir vídeo
* [x] Detectar rosto
* [x] Desenhar retângulo
* [x] Detectar landmarks
* [x] Gerar embedding
* [x] Exibir embedding no console
* [x] Parar câmera
* [x] Organizar código em módulos

Ainda não temos:

* [ ] Cadastro de pessoas
* [ ] Identificação de uma pessoa
* [ ] Comparação entre embeddings
* [ ] Banco de dados
* [ ] Backend
* [ ] Login
* [ ] Controle de acesso
* [ ] Integração com fechadura
* [ ] ESP32
* [ ] Histórico de acessos

Essas funcionalidades podem ser adicionadas posteriormente, uma etapa de cada vez.

---

# 29. Próximas possíveis evoluções

Uma possível evolução da arquitetura seria:

```text
js/
├── app.js
├── camera.js
├── face.js
├── ui.js
├── embedding.js
├── person.js
└── storage.js
```

Onde:

### embedding.js

Responsável por operações com embeddings:

```text
Comparar embeddings
Calcular distância
Verificar similaridade
```

### person.js

Responsável por pessoas:

```text
Cadastrar pessoa
Editar pessoa
Remover pessoa
Identificar pessoa
```

### storage.js

Responsável pelo armazenamento:

```text
Salvar dados
Buscar dados
Remover dados
```

Essas partes devem ser adicionadas somente quando realmente forem necessárias.

---

# 30. Regra principal do projeto

A ideia deste POC é evoluir aos poucos.

Primeiro:

```text
Câmera
   ↓
Rosto
   ↓
Embedding
```

Depois:

```text
Embedding
   ↓
Comparação
```

Depois:

```text
Pessoa
   ↓
Embedding
   ↓
Comparação
```

E somente posteriormente podemos pensar em:

```text
Pessoa reconhecida
       ↓
Permissão
       ↓
Ação
```

Isso mantém o projeto simples e facilita entender cada etapa antes de adicionar a próxima.
