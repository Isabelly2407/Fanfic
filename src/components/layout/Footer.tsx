import { Link } from 'react-router-dom';
import { BookOpen, Mail, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-graphite border-t border-primary/20 mt-auto">
      <div className="max-w-[120rem] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground">Fanfic</h3>
            </div>
            <p className="text-foreground/70 font-paragraph text-sm">
              Plataforma completa para escritores literários. Organize suas histórias, personagens e narrativas com ferramentas profissionais.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-heading font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/editor" className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  Editor de Histórias
                </Link>
              </li>
              <li>
                <Link to="/characters" className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  Gerenciar Personagens
                </Link>
              </li>
              <li>
                <Link to="/narrative-tree" className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  Árvore Narrativa
                </Link>
              </li>
              <li>
                <Link to="/timeline" className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  Linha do Tempo
                </Link>
              </li>
              <li>
                <Link to="/language-bank" className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  Banco de Linguagem
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-heading font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:suporte@fanfic.app" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  <Mail className="w-4 h-4" />
                  suporte@fanfic.app
                </a>
              </li>
              <li>
                <Link to="/help" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm">
                  <HelpCircle className="w-4 h-4" />
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center">
          <p className="text-foreground/60 font-paragraph text-sm">
            © {new Date().getFullYear()} Fanfic. Todos os direitos reservados. Feito com dedicação para escritores.
          </p>
        </div>
      </div>
    </footer>
  );
}
