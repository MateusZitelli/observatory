# Observatório Piedade

Simulador técnico do observatório particular em Piedade, São Paulo. O aplicativo
combina um modelo 3D da montagem equatorial e do cômodo com plantas, cortes
construtivos e uma carta do céu local.

> Esta branch contém o protótipo modular em TypeScript. A aplicação publicada e
> funcional permanece na branch `main`; o bootstrap deste protótipo ainda não foi
> integrado.

## Recursos

- Cinemática visual da montagem equatorial, tubo e contrapesos
- Volume varrido e avisos de colisão com paredes e telhado
- Cômodo, mobiliário, observador e telhado deslizante
- Planta baixa, elevações e cortes técnicos
- Carta celeste calculada para Piedade
- Panorama 360° substituível pelo usuário
- Estado persistido localmente no navegador

## Desenvolvimento

Requer Node.js 22 ou superior.

```sh
npm install
npm run dev
```

Validação completa:

```sh
npm run check
npm run build
```

O projeto usa TypeScript em modo estrito e Oxlint type-aware com zero avisos.
Todo arquivo de texto autoral — código, configuração, documentação ou workflow —
tem o limite rígido de 100 linhas físicas. Lockfiles e saídas geradas são excluídos.

## Publicação

Cada push para `main` valida, compila e publica `dist/` no GitHub Pages por meio
do workflow `.github/workflows/pages.yml`.
