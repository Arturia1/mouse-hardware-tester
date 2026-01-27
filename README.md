# 🖱️ Mouse Hardware Tester 

O **Mouse Hardware Tester** é uma aplicação web de alta precisão desenvolvida para técnicos de hardware e entusiastas de periféricos. Diferente de testadores comuns, esta ferramenta comunica-se diretamente com o firmware do dispositivo através da **WebHID API** para extrair dados reais de fabricação e desempenho.



## ✨ Funcionalidades Principais

- **🔍 Detecção de Firmware**: Identifica o modelo real do mouse, Vendor ID (VID), Product ID (PID) e Serial Number (quando disponível pelo hardware).
- **🟢 Checklist de Validação**: Sistema de status persistente onde o mouse só é considerado "Apto para Uso" após a verificação bem-sucedida de:
  - Clique Esquerdo.
  - Clique Direito.
  - Scroll Wheel calibrado.
- **⚙️ Calibrador de Scroll**: Monitoramento de Delta em tempo real. A ferramenta instrui o técnico sobre a faixa ideal (100-120) para detectar encoders sujos ou defeituosos.
- **⚡ Polling Rate (Hz)**: Medição em tempo real da taxa de atualização do sensor.
- **🎨 Interface Técnica**: Layout moderno em Dark Mode com feedback visual dinâmico via Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- [React.js](https://reactjs.org/) - Biblioteca principal.
- [Tailwind CSS](https://tailwindcss.com/) - Estilização e animações de estado.
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) - Comunicação direta com o hardware USB.
- [Vite](https://vitejs.dev/) - Tooling de desenvolvimento ultra-rápido.
