import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { BancodeLinguagem } from '@/entities';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookMarked, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LanguageBankPage() {
  const { toast } = useToast();
  
  const [suggestions, setSuggestions] = useState<BancodeLinguagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const { items } = await BaseCrudService.getAll<BancodeLinguagem>('bancodelinguagem');
      setSuggestions(items);
    } catch (error) {
      toast({
        title: 'Erro ao carregar sugestões',
        description: 'Não foi possível carregar o banco de linguagem.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = suggestions.map(s => s.category).filter(Boolean);
    return Array.from(new Set(categories));
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = !searchTerm || 
      suggestion.suggestionTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.suggestionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.explanation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || suggestion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/60 font-paragraph">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-8">
        <div className="max-w-[120rem] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Banco de Linguagem</h1>
            <p className="text-foreground/60 font-paragraph">
              Sugestões de expressões narrativas, descrições físicas conscientes e linguagem respeitosa para enriquecer sua escrita.
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-graphite border-primary/20 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar sugestões..."
                  className="pl-10 bg-background border-primary/20 text-foreground"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background border-primary/20 text-foreground">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-graphite border-primary/20">
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category} value={category || ''}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Suggestions Grid */}
          {filteredSuggestions.length === 0 ? (
            <Card className="bg-graphite border-primary/20 p-12 text-center">
              <BookMarked className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'Nenhuma sugestão encontrada' : 'Banco vazio'}
              </h3>
              <p className="text-foreground/60 font-paragraph">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'O banco de linguagem ainda não possui sugestões cadastradas.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuggestions.map((suggestion) => (
                <Card key={suggestion._id} className="bg-graphite border-primary/20 p-6 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-foreground flex-1">
                      {suggestion.suggestionTitle}
                    </h3>
                    {suggestion.category && (
                      <span className="px-3 py-1 bg-secondary/20 rounded-full text-xs font-paragraph text-secondary ml-2 flex-shrink-0">
                        {suggestion.category}
                      </span>
                    )}
                  </div>

                  {suggestion.suggestionText && (
                    <div className="mb-4 p-4 bg-background rounded-lg border border-primary/20">
                      <p className="text-foreground font-paragraph italic">
                        "{suggestion.suggestionText}"
                      </p>
                    </div>
                  )}

                  {suggestion.explanation && (
                    <div className="mb-3">
                      <p className="text-xs font-paragraph text-foreground/60 mb-1">Explicação:</p>
                      <p className="text-sm font-paragraph text-foreground/80">
                        {suggestion.explanation}
                      </p>
                    </div>
                  )}

                  {suggestion.usageExample && (
                    <div className="pt-3 border-t border-primary/20">
                      <p className="text-xs font-paragraph text-foreground/60 mb-1">Exemplo de uso:</p>
                      <p className="text-sm font-paragraph text-foreground/70 italic">
                        {suggestion.usageExample}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Info Section */}
          <Card className="bg-graphite border-primary/20 p-8 mt-8">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
              Como usar o Banco de Linguagem
            </h2>
            <div className="space-y-4 text-foreground/80 font-paragraph">
              <p>
                O Banco de Linguagem é uma ferramenta de apoio à sua escrita, oferecendo sugestões e alternativas que você pode considerar ao desenvolver suas narrativas.
              </p>
              <p>
                <strong className="text-foreground">Importante:</strong> Estas são apenas sugestões. Você sempre tem a liberdade de escolher como expressar suas ideias. O objetivo é inspirar e oferecer opções, nunca impor um estilo específico.
              </p>
              <p>
                Use as categorias para encontrar sugestões específicas, como descrições físicas conscientes que respeitam a diversidade, ou expressões narrativas que podem enriquecer diferentes momentos da sua história.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
