import { useMember } from '@/integrations';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Palette, Download, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { member } = useMember();
  const { toast } = useToast();

  const handleExportData = () => {
    toast({
      title: 'Exportação em desenvolvimento',
      description: 'A funcionalidade de exportação completa será implementada em breve.',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-8">
        <div className="max-w-[100rem] mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-8">Configurações</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Settings */}
            <Card className="bg-graphite border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-foreground">Conta</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-paragraph text-foreground/60 mb-1">Email</p>
                  <p className="text-lg font-paragraph text-foreground">{member?.loginEmail || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-paragraph text-foreground/60 mb-1">Nome de usuário</p>
                  <p className="text-lg font-paragraph text-foreground">
                    {member?.profile?.nickname || member?.contact?.firstName || 'Não informado'}
                  </p>
                </div>
                <div className="pt-4 border-t border-primary/20">
                  <p className="text-sm font-paragraph text-foreground/70 mb-4">
                    Suas informações de conta são gerenciadas localmente e de forma segura.
                  </p>
                </div>
              </div>
            </Card>

            {/* Visual Preferences */}
            <Card className="bg-graphite border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-foreground">Aparência</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-paragraph text-foreground/60 mb-2">Tema</p>
                  <div className="p-4 bg-background rounded-lg border border-primary/20">
                    <p className="text-foreground font-paragraph">Modo Escuro (Padrão)</p>
                    <p className="text-xs font-paragraph text-foreground/60 mt-1">
                      O modo escuro é otimizado para reduzir fadiga visual durante longas sessões de escrita.
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-paragraph text-foreground/60 mb-2">Paleta de Cores</p>
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 bg-primary rounded-lg">
                      <p className="text-xs font-paragraph text-primary-foreground">Roxo Primário</p>
                    </div>
                    <div className="flex-1 p-3 bg-secondary rounded-lg">
                      <p className="text-xs font-paragraph text-secondary-foreground">Dourado</p>
                    </div>
                    <div className="flex-1 p-3 bg-graphite rounded-lg border border-primary/20">
                      <p className="text-xs font-paragraph text-foreground">Grafite</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Settings */}
            <Card className="bg-graphite border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-foreground">Exportação</h2>
              </div>

              <div className="space-y-4">
                <p className="text-foreground/70 font-paragraph">
                  Exporte suas histórias, personagens, árvores narrativas e linhas do tempo.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleExportData}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Histórias (PDF)
                  </Button>
                  <Button 
                    onClick={handleExportData}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Árvore Narrativa (Imagem)
                  </Button>
                  <Button 
                    onClick={handleExportData}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Linha do Tempo (PDF)
                  </Button>
                  <Button 
                    onClick={handleExportData}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Todos os Dados
                  </Button>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="bg-graphite border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-foreground">Notificações</h2>
              </div>

              <div className="space-y-4">
                <p className="text-foreground/70 font-paragraph">
                  Configure como você deseja receber atualizações e lembretes.
                </p>
                <div className="space-y-3">
                  <div className="p-4 bg-background rounded-lg border border-primary/20">
                    <p className="text-foreground font-paragraph mb-1">Lembretes de Escrita</p>
                    <p className="text-xs font-paragraph text-foreground/60">
                      Receba lembretes para manter sua rotina de escrita
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-primary/20">
                    <p className="text-foreground font-paragraph mb-1">Atualizações do Sistema</p>
                    <p className="text-xs font-paragraph text-foreground/60">
                      Seja notificado sobre novas funcionalidades
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Principles Reminder */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 p-8 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  Nossos Princípios
                </h3>
                <p className="text-foreground/80 font-paragraph mb-4">
                  O Fanfic foi criado com respeito total à sua criatividade e autonomia como escritor. Todas as ferramentas são projetadas para apoiar, nunca para substituir ou impor.
                </p>
                <ul className="space-y-2 text-foreground/70 font-paragraph text-sm">
                  <li>✓ Nunca reescrevemos seu texto automaticamente</li>
                  <li>✓ Nunca impomos um estilo específico</li>
                  <li>✓ Sempre oferecemos sugestões, nunca soluções obrigatórias</li>
                  <li>✓ Você tem controle total sobre seus dados e exportações</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
