import React, { useState, useEffect, useRef } from 'react';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  GitBranch, 
  Clock, 
  BookMarked, 
  Sparkles, 
  FileText, 
  Download, 
  ChevronRight, 
  Terminal, 
  Cpu, 
  Share2, 
  Zap,
  PenTool,
  Lightbulb,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Image } from '@/components/ui/image';

type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className, 
  delay = 0,
  direction = 'up' 
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(element);
            }
        }, { threshold: 0.15 });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const getTransform = () => {
      if (!isVisible) {
        switch(direction) {
          case 'up': return 'translateY(30px)';
          case 'left': return 'translateX(-30px)';
          case 'right': return 'translateX(30px)';
          default: return 'none';
        }
      }
      return 'translate(0)';
    };

    return (
      <div 
        ref={ref} 
        className={`${className || ''} transition-all duration-1000 ease-out will-change-transform`}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: getTransform(),
          transitionDelay: `${delay}ms`
        }}
      >
        {children}
      </div>
    );
};

const NeonCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-white/10 bg-graphite/50 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(160, 32, 240, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

export default function HomePage() {
  const { isAuthenticated, actions } = useMember();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const codeLines = [
    '// Capítulo 1: O Despertar',
    'const personagem = {',
    '  nome: "Elena",',
    '  idade: 24,',
    '  habilidade: "Controle Temporal"',
    '};',
    '',
    'function iniciarJornada() {',
    '  return "A história começa...";',
    '}',
  ];

  const features = [
    {
      icon: PenTool,
      title: 'Editor Avançado',
      description: 'Escreva suas histórias com organização por capítulos e cenas, modo escuro e links interativos.',
      id: 'feat-1'
    },
    {
      icon: Users,
      title: 'Gestão de Personagens',
      description: 'Organize personagens por pastas, crie versões alternativas e mantenha tudo isolado por história.',
      id: 'feat-2'
    },
    {
      icon: Lightbulb,
      title: 'Árvore Narrativa',
      description: 'Visualize relações familiares, sociais e espirituais com sistema de reencarnações interativo.',
      id: 'feat-3'
    },
    {
      icon: Calendar,
      title: 'Linha do Tempo',
      description: 'Gerencie eventos ligados a personagens, capítulos e vidas com suporte a múltiplas eras.',
      id: 'feat-4'
    },
    {
      icon: Sparkles,
      title: 'Banco de Linguagem',
      description: 'Acesse sugestões de expressões narrativas e descrições respeitosas sem reescrever seu texto.',
      id: 'feat-5'
    },
    {
      icon: Sparkles,
      title: 'Assistência Inteligente',
      description: 'Revisão técnica e análise narrativa que respeita seu estilo, sem impor soluções.',
      id: 'feat-6'
    },
  ];

  const customStyles = `
    .bg-grid-pattern {
      background-size: 40px 40px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    }
    .text-glow {
      text-shadow: 0 0 20px rgba(160, 32, 240, 0.5);
    }
    .clip-diagonal {
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
    }
    .clip-diagonal-reverse {
      clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 100%);
    }
  `;

  return (
    <div className="min-h-screen bg-background text-foreground font-paragraph selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      <style>{customStyles}</style>
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      <Header />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background" />
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <AnimatedElement delay={100}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Sistema Online v2.0
              </div>
            </AnimatedElement>

            <AnimatedElement delay={200}>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-bold leading-tight tracking-tight">
                Crie Seus <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary text-glow">
                  Mundos Narrativos
                </span>
              </h1>
            </AnimatedElement>

            <AnimatedElement delay={300}>
              <p className="text-xl text-foreground/60 max-w-xl leading-relaxed">
                O mecanismo narrativo definitivo para arquitetos literários. Organize personagens, visualize linhas do tempo e teia histórias complexas em um ambiente de alta tecnologia projetado para foco.
              </p>
            </AnimatedElement>

            <AnimatedElement delay={400}>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Button
                    onClick={() => navigate('/editor')}
                    size="lg"
                    className="bg-primary text-white hover:bg-primary/90 font-heading text-lg px-8 h-14 rounded-none border-l-4 border-secondary"
                  >
                    <Terminal className="mr-2 h-5 w-5" />
                    Inicializar Editor
                  </Button>
                ) : (
                  <Button
                    onClick={actions.login}
                    size="lg"
                    className="bg-primary text-white hover:bg-primary/90 font-heading text-lg px-8 h-14 rounded-none border-l-4 border-secondary"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Iniciar Sequência
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-foreground hover:bg-white/5 font-heading text-lg px-8 h-14 rounded-none"
                >
                  Explorar Sistema
                </Button>
              </div>
            </AnimatedElement>
          </div>

          <AnimatedElement direction="left" delay={500} className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-full h-full border border-primary/20 z-0" />
              <div className="absolute -bottom-10 -left-10 w-full h-full border border-secondary/20 z-0" />
              
              <motion.div 
                className="relative z-10 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.01, rotateX: 2, rotateY: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ perspective: 1000 }}
              >
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-xs font-mono text-white/30">story_engine.tsx</div>
                </div>

                <div className="p-8 font-mono text-sm md:text-base leading-loose">
                  {codeLines.map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                      className={`flex ${
                        line.includes('//') ? 'text-gray-500 italic' :
                        line.includes('const') || line.includes('function') || line.includes('return') ? 'text-primary' :
                        line.includes('"') ? 'text-secondary' :
                        'text-foreground/80'
                      }`}
                    >
                      <span className="w-8 text-white/10 select-none text-right mr-4">{index + 1}</span>
                      {line || '\u00A0'}
                    </motion.div>
                  ))}
                  <motion.div 
                    className="w-3 h-5 bg-primary mt-1 ml-12"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </div>
          </AnimatedElement>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] uppercase tracking-widest">Role para Inicializar</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      <div className="w-full bg-primary/5 border-y border-primary/10 overflow-hidden py-3">
        <motion.div 
          className="flex whitespace-nowrap gap-16 text-sm font-mono text-primary/60 uppercase tracking-widest"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-2"><PenTool className="w-4 h-4" /> Motor Narrativo Ativo</span>
              <span className="flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Sincronização de Linha do Tempo</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Banco de Dados de Personagens</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Assistente IA em Espera</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="mb-20 max-w-3xl">
            <AnimatedElement>
              <h2 className="text-5xl font-heading font-bold mb-6">
                Módulos do <span className="text-primary">Sistema</span>
              </h2>
            </AnimatedElement>
            <AnimatedElement delay={100}>
              <p className="text-xl text-foreground/60">
                Um conjunto abrangente de ferramentas projetadas para aumentar suas capacidades criativas sem substituir sua intenção artística.
              </p>
            </AnimatedElement>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedElement key={feature.id} delay={index * 100}>
                <NeonCard className="h-full rounded-2xl p-8 group hover:-translate-y-2 transition-transform duration-300">
                  <div className="mb-6 w-14 h-14 rounded-lg bg-background border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(160,32,240,0.3)] transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-mono text-primary/50 group-hover:text-primary transition-colors">
                    <span className="uppercase tracking-wider">Acessar Módulo</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </NeonCard>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-graphite/20 relative clip-diagonal">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
               <Image 
                 src="https://static.wixstatic.com/media/e2fff9_d53b5ca437c44ad7b0fa1eaea3431351~mv2.png?originWidth=768&originHeight=576"
                 alt="Visualização interativa da Árvore Narrativa mostrando conexões entre personagens"
                 className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                 width={800}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 right-8">
                 <div className="inline-block px-3 py-1 mb-4 bg-secondary/20 text-secondary text-xs font-mono rounded-full border border-secondary/30">
                   MECANISMO DE VISUALIZAÇÃO
                 </div>
                 <h3 className="text-3xl font-heading font-bold mb-2">Relações Complexas Mapeadas</h3>
                 <p className="text-sm text-foreground/70">
                   Veja os fios invisíveis conectando seus personagens através do tempo e do espaço.
                 </p>
               </div>
            </div>

            <div className="space-y-16">
              <AnimatedElement direction="right">
                <div className="pl-8 border-l-2 border-primary/30">
                  <h3 className="text-3xl font-heading font-bold mb-4 text-white">A Árvore Narrativa</h3>
                  <p className="text-lg text-foreground/60 leading-relaxed">
                    Visualize linhagens familiares, círculos sociais e conexões espirituais. Nosso sistema baseado em nós permite rastrear reencarnações através de diferentes eras, garantindo consistência em sua mitologia.
                  </p>
                </div>
              </AnimatedElement>

              <AnimatedElement direction="right" delay={100}>
                <div className="pl-8 border-l-2 border-secondary/30">
                  <h3 className="text-3xl font-heading font-bold mb-4 text-white">Linhas do Tempo Paralelas</h3>
                  <p className="text-lg text-foreground/60 leading-relaxed">
                    Gerencie eventos que acontecem simultaneamente ou através de épocas vastas. Vincule eventos específicos da linha do tempo diretamente a capítulos e estágios de vida dos personagens. Nunca mais perca o controle do "quando".
                  </p>
                </div>
              </AnimatedElement>

              <AnimatedElement direction="right" delay={200}>
                <div className="pl-8 border-l-2 border-white/10">
                  <h3 className="text-3xl font-heading font-bold mb-4 text-white">Isolamento de Personagens</h3>
                  <p className="text-lg text-foreground/60 leading-relaxed">
                    Mantenha seu espaço de trabalho limpo. O editor compreende contextualmente quais personagens pertencem à história atual, prevenindo desordem no banco de dados e sobrecarga cognitiva.
                  </p>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 overflow-hidden">
        <div className="container mx-auto px-6 mb-16">
          <AnimatedElement>
            <h2 className="text-5xl font-heading font-bold text-center">Diretrizes <span className="text-secondary">Principais</span></h2>
          </AnimatedElement>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedElement delay={0}>
              <div className="bg-gradient-to-br from-white/5 to-transparent p-10 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FileText className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-heading font-bold mb-4 text-secondary">Soberania do Autor</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Nunca reescrevemos sua prosa automaticamente. Você é o criador; somos os arquitetos fornecendo o projeto. Sua voz permanece 100% sua.
                  </p>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement delay={100}>
              <div className="bg-gradient-to-br from-white/5 to-transparent p-10 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-heading font-bold mb-4 text-primary">IA Respeitosa</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Nossa assistência imita um leitor beta respeitoso. Apontamos inconsistências e oferecemos sugestões breves, nunca impondo um estilo ou solução.
                  </p>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement delay={200}>
              <div className="bg-gradient-to-br from-white/5 to-transparent p-10 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Share2 className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-heading font-bold mb-4 text-white">Propriedade de Dados</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Seus mundos pertencem a você. Exporte suas árvores narrativas, linhas do tempo e manuscritos para PDF ou formatos de imagem instantaneamente. Sem bloqueio.
                  </p>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      <section className="h-[60vh] relative w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
           <Image 
             src="https://static.wixstatic.com/media/e2fff9_e4ab55b48248418b8bf9f208705ea81e~mv2.png?originWidth=1920&originHeight=640"
             alt="Paisagem neon abstrata representando a vastidão da imaginação"
             className="w-full h-full object-cover opacity-40"
             width={1920}
           />
           <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6">
          <AnimatedElement>
            <blockquote className="text-3xl md:text-5xl font-heading font-bold leading-tight">
              "O momento mais assustador é sempre logo antes de você começar."
            </blockquote>
            <cite className="block mt-8 text-xl text-primary font-mono not-italic">— Stephen King</cite>
          </AnimatedElement>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <AnimatedElement>
            <h2 className="text-6xl md:text-8xl font-heading font-bold mb-8 tracking-tighter">
              COMECE A <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">CRIAR</span>
            </h2>
          </AnimatedElement>
          
          <AnimatedElement delay={100}>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-12">
              Junte-se à nova geração de arquitetos literários. Organize seu caos. Esclareça sua visão. Escreva sua obra-prima.
            </p>
          </AnimatedElement>

          <AnimatedElement delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {!isAuthenticated && (
                <Button
                  onClick={actions.login}
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-heading text-xl px-12 py-8 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all duration-300"
                >
                  Criar Conta Grátis
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/about')}
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 font-heading text-xl px-12 py-8 rounded-full"
              >
                Ver Documentação
              </Button>
            </div>
          </AnimatedElement>

          <div className="mt-20 flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2"><Download className="w-6 h-6" /> <span className="font-mono">EXPORTAR PDF</span></div>
             <div className="flex items-center gap-2"><Share2 className="w-6 h-6" /> <span className="font-mono">SINCRONIZAÇÃO NA NUVEM</span></div>
             <div className="flex items-center gap-2"><Zap className="w-6 h-6" /> <span className="font-mono">SALVAMENTO INSTANTÂNEO</span></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
