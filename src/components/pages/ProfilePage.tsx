import { useMember } from '@/integrations';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfilePage() {
  const { member } = useMember();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-8">
        <div className="max-w-[100rem] mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-8">Meu Perfil</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-graphite border-primary/20 p-8 lg:col-span-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-heading font-bold text-primary-foreground">
                    {member?.profile?.nickname?.[0]?.toUpperCase() || member?.contact?.firstName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {member?.profile?.nickname || member?.contact?.firstName || 'Usuário'}
                </h2>
                {member?.profile?.title && (
                  <p className="text-foreground/70 font-paragraph">{member.profile.title}</p>
                )}
              </div>
            </Card>

            <Card className="bg-graphite border-primary/20 p-8 lg:col-span-2">
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-6">Informações da Conta</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-paragraph text-foreground/60 mb-1">Nome</p>
                    <p className="text-lg font-paragraph text-foreground">
                      {member?.contact?.firstName && member?.contact?.lastName
                        ? `${member.contact.firstName} ${member.contact.lastName}`
                        : member?.contact?.firstName || member?.profile?.nickname || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-paragraph text-foreground/60 mb-1">Email</p>
                    <p className="text-lg font-paragraph text-foreground">
                      {member?.loginEmail || 'Não informado'}
                    </p>
                    {member?.loginEmailVerified && (
                      <p className="text-sm font-paragraph text-secondary mt-1">✓ Verificado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-paragraph text-foreground/60 mb-1">Membro desde</p>
                    <p className="text-lg font-paragraph text-foreground">
                      {member?._createdDate
                        ? format(new Date(member._createdDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : 'Não disponível'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-paragraph text-foreground/60 mb-1">Status da Conta</p>
                    <p className="text-lg font-paragraph text-foreground capitalize">
                      {member?.status?.toLowerCase() || 'Ativo'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
