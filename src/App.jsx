import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  // --- Estados de Identificação ---
  const [deviceInfo, setDeviceInfo] = useState({ 
    model: "Aguardando Detecção...", 
    vendor: "---",
    serial: "---"
  });
  
  // --- Estados de Verificação ---
  const [tests, setTests] = useState({
    leftClick: false,
    rightClick: false,
    scrollOk: false
  });

  // --- NOVO: Estado de Reprovação Manual ---
  const [isDefective, setIsDefective] = useState(false);

  const [stats, setStats] = useState({ pollingRate: 0 });
  const [currentDelta, setCurrentDelta] = useState(0);

  // --- Refs ---
  const moveCount = useRef(0);
  const lastTime = useRef(performance.now());

  // --- Lógica de Aprovação Final ---
  // Só é apto se passou nos testes E NÃO foi marcado como defeituoso
  const isAptoParaUso = tests.leftClick && tests.rightClick && tests.scrollOk && !isDefective;

  // --- Função para Detectar Modelo via Firmware (WebHID) ---
  const connectMouse = async () => {
    try {
      if (!navigator.hid) return alert("Navegador incompatível.");
      
      const devices = await navigator.hid.requestDevice({ filters: [] });
      
      if (devices.length > 0) {
        const d = devices[0];
        await d.open();
        
        setDeviceInfo({
          model: d.productName || "Mouse Genérico",
          vendor: `ID: ${d.vendorId.toString(16).toUpperCase()}`,
          serial: d.serialNumber || "N/D (Protegido)"
        });
        // Reseta o status de defeito ao conectar novo mouse
        setIsDefective(false);
      }
    } catch (e) {
      console.log("Conexão cancelada.");
    }
  };

  // --- Handlers de Eventos ---
  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      // Se estiver marcado como defeituoso, ignora novos testes de clique
      if (isDefective) return;

      if (e.button === 0) setTests(prev => ({ ...prev, leftClick: true }));
      if (e.button === 2) setTests(prev => ({ ...prev, rightClick: true }));
    };

    const handleMouseMove = () => {
      moveCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setStats({ pollingRate: moveCount.current });
        moveCount.current = 0;
        lastTime.current = now;
      }
    };

    const handleWheel = (e) => {
      const delta = Math.abs(e.deltaY);
      setCurrentDelta(delta);
      
      if (isDefective) return; // Ignora validação se já reprovado

      if (delta >= 100 && delta <= 120) {
        setTests(prev => ({ ...prev, scrollOk: true }));
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
    window.oncontextmenu = (e) => e.preventDefault();

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isDefective]); // Adicionado isDefective nas dependências

  // --- Função de Reset Total ---
  const resetTests = () => {
    setTests({ leftClick: false, rightClick: false, scrollOk: false });
    setIsDefective(false);
    setCurrentDelta(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-700 font-sans select-none">
      
      <div className="bg-zinc-200 w-full max-w-6xl rounded-[40px] p-10 shadow-2xl flex flex-col lg:flex-row gap-10 items-center border border-white/20">
        
        {/* ESPECIFICAÇÕES DO FIRMWARE */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-zinc-300 p-6 rounded-3xl shadow-inner border border-zinc-400/20">
            <h2 className="text-zinc-500 font-bold uppercase text-xs mb-4 tracking-wider">Firmware do Mouse</h2>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase font-bold">Modelo Detectado:</p>
              <p className="text-xl font-black text-zinc-800 leading-tight">
                {deviceInfo.model}
              </p>
              <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-600 mt-4">
                <span className="bg-zinc-400/30 px-3 py-1 rounded">FABRICANTE: {deviceInfo.vendor}</span>
                <span className="bg-zinc-400/30 px-3 py-1 rounded italic">S/N: {deviceInfo.serial}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-300 p-6 rounded-3xl shadow-inner border border-zinc-400/20">
            <h2 className="text-zinc-500 font-bold uppercase text-xs mb-2 tracking-wider">Calibração de Scroll</h2>
            <div className="flex justify-between items-center mb-3">
              <p className={`text-4xl font-black ${tests.scrollOk ? 'text-green-600' : isDefective ? 'text-red-500' : 'text-zinc-700'}`}>
                {currentDelta} <span className="text-sm font-normal text-zinc-500">Delta</span>
              </p>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${tests.scrollOk ? 'bg-green-100 text-green-700' : 'bg-zinc-400/20 text-zinc-500'}`}>
                {tests.scrollOk ? '✓ CALIBRADO' : 'AGUARDANDO'}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 bg-zinc-400/10 p-2 rounded-lg leading-tight border border-zinc-400/10">
              *Mouses padrão geralmente têm Delta fixo de <span className="font-bold text-zinc-700">100 ou 120</span>. Valores quebrados ou fora desta faixa podem indicar sujeira ou defeito no encoder.
            </p>
          </div>
        </div>

        {/* VISUALIZADOR (ESTADO DINÂMICO: NEUTRO, APTO OU DEFEITO) */}
        <div className="flex-none flex flex-col items-center gap-6">
            <div 
              className={`w-56 h-80 rounded-[75px] border-4 relative overflow-hidden transition-all duration-500
              ${isDefective 
                ? 'bg-red-500 border-red-600 shadow-[0_0_100px_rgba(239,68,68,0.8)] scale-100' // Estilo de Defeito (Vermelho)
                : isAptoParaUso 
                  ? 'bg-green-500 border-green-400 shadow-[0_0_100px_rgba(34,197,94,0.8)] scale-105' // Estilo Apto (Verde)
                  : 'bg-white border-zinc-300 shadow-xl' // Estilo Neutro
              }`}
            >
                {/* Botão Esquerdo */}
                <div className={`absolute top-0 left-0 w-1/2 h-36 border-r border-b border-zinc-100 transition-colors duration-500 
                  ${isDefective ? 'bg-red-400 border-red-300' : tests.leftClick ? 'bg-green-400' : 'bg-zinc-50'}`} />
                
                {/* Botão Direito */}
                <div className={`absolute top-0 right-0 w-1/2 h-36 border-l border-b border-zinc-100 transition-colors duration-500 
                  ${isDefective ? 'bg-red-400 border-red-300' : tests.rightClick ? 'bg-green-400' : 'bg-zinc-50'}`} />
                
                {/* Scroll Wheel */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-8 h-14 bg-zinc-200 rounded-full border border-zinc-300 flex justify-center py-2 z-10 shadow-sm">
                   <div className={`w-2 h-full rounded-full transition-all duration-500 
                     ${isDefective ? 'bg-red-800' : tests.scrollOk ? 'bg-green-600 scale-y-110 shadow-[0_0_10px_green]' : 'bg-zinc-400'}`} />
                </div>
                
                {/* Ícone de X ou Check (Opcional, decorativo) */}
                {isDefective && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 text-9xl font-black text-red-900 pointer-events-none">
                    ×
                  </div>
                )}
            </div>
            
            {/* MENSAGEM DE STATUS */}
            <div className="h-10">
              {isAptoParaUso && (
                <div className="bg-green-600 text-white px-8 py-2 rounded-full text-xs font-black tracking-widest animate-bounce shadow-xl border-2 border-white/20">
                  MOUSE APTO PARA USO
                </div>
              )}
              {isDefective && (
                <div className="bg-red-600 text-white px-8 py-2 rounded-full text-xs font-black tracking-widest animate-pulse shadow-xl border-2 border-white/20">
                  MOUSE COM DEFEITO
                </div>
              )}
            </div>
        </div>

        {/* PERFORMANCE E AÇÕES */}
        <div className="flex-1 w-full space-y-4">
          <div className={`bg-zinc-800 p-8 rounded-3xl text-white shadow-2xl border-b-8 transition-colors ${isDefective ? 'border-red-600' : 'border-green-600'}`}>
             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1 italic text-center text-zinc-400">Taxa de Atualização</p>
             <div className="flex items-baseline justify-center gap-1">
               <span className="text-6xl font-black">{stats.pollingRate}</span>
               <span className="text-xl uppercase font-bold text-zinc-500">Hz</span>
             </div>
          </div>

          <button 
            onClick={connectMouse} 
            className="w-full py-4 bg-zinc-300 hover:bg-white text-zinc-800 font-black rounded-2xl shadow-md transition-all active:scale-95 border border-zinc-400/30"
          >
            DETECTAR HARDWARE
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={resetTests} 
              className="flex-1 py-3 bg-zinc-400/10 text-zinc-500 hover:text-zinc-700 font-bold rounded-2xl transition-all text-xs uppercase"
            >
              Limpar
            </button>
            
            {/* NOVO BOTÃO DE REPROVAÇÃO */}
            <button 
              onClick={() => setIsDefective(true)} 
              className="flex-1 py-3 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-2xl transition-all text-xs uppercase border border-red-200"
            >
              Reprovar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;