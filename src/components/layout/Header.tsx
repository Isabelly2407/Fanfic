import { Link, useLocation } from 'react-router-dom';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GitBranch, Clock, BookMarked, Settings, LogOut } from 'lucide-react';

export default function Header() {
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-graphite border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-[120rem] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Fanfic</h1>
          </Link>

          {isAuthenticated && (
            <nav className="flex items-center gap-6">
              <Link
                to="/editor"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/editor')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-paragraph">Editor</span>
              </Link>
              <Link
                to="/characters"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/characters')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="font-paragraph">Personagens</span>
              </Link>
              <Link
                to="/narrative-tree"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/narrative-tree')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span className="font-paragraph">Árvore</span>
              </Link>
              <Link
                to="/timeline"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/timeline')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-paragraph">Linha do Tempo</span>
              </Link>
              <Link
                to="/language-bank"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/language-bank')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span className="font-paragraph">Banco de Linguagem</span>
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {isLoading && <div className="text-foreground/60">Carregando...</div>}
            {!isLoading && !isAuthenticated && (
              <Button onClick={actions.login} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Entrar
              </Button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-heading font-bold">
                        {member?.profile?.nickname?.[0]?.toUpperCase() || member?.contact?.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-foreground font-paragraph">
                      {member?.profile?.nickname || member?.contact?.firstName || 'Usuário'}
                    </span>
                  </div>
                </Link>
                <Button
                  onClick={actions.logout}
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
