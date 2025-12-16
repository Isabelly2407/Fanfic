import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { BancodeLinguagem } from '@/entities';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BookMarked, Search, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LanguageBankPage() {
  const { toast } = useToast();
  
  const [suggestions, setSuggestions] = useState<BancodeLinguagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const generateAiSuggestions = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: 'Digite um termo',
        description: 'Por favor, digite o tipo de linguagem ou palavra que deseja explorar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simulate AI suggestions based on search term
      const suggestions = generateLanguageSuggestions(searchTerm);
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
      
      toast({
        title: 'Sugestões geradas!',
        description: `${suggestions.length} palavras relacionadas a "${searchTerm}" foram encontradas.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar sugestões',
        description: 'Não foi possível gerar as sugestões de IA.',
        variant: 'destructive',
      });
    }
  };

  const generateLanguageSuggestions = (term: string): string[] => {
    const term_lower = term.toLowerCase();
    
    // Mapping of language types to related words
    const languageSuggestions: { [key: string]: string[] } = {
      // Emotions
      'tristeza': ['melancolia', 'desespero', 'angústia', 'luto', 'pesar', 'desolação', 'sofrimento', 'mágoa'],
      'alegria': ['felicidade', 'euforia', 'contentamento', 'júbilo', 'regozijo', 'deleite', 'satisfação', 'exultação'],
      'raiva': ['fúria', 'ódio', 'indignação', 'rancor', 'ressentimento', 'cólera', 'ira', 'exasperação'],
      'medo': ['terror', 'pavor', 'horror', 'pânico', 'apreensão', 'angústia', 'temor', 'fobia'],
      'amor': ['afeto', 'carinho', 'paixão', 'devoção', 'ternura', 'adoração', 'afeição', 'estima'],
      
      // Descriptions
      'beleza': ['esplendor', 'formosura', 'graça', 'elegância', 'encanto', 'lindeza', 'magnificência', 'brilho'],
      'fealdade': ['deformidade', 'grotesco', 'repugnância', 'asquerosidade', 'desagrado', 'feiura', 'abominação'],
      'escuridão': ['treva', 'penumbra', 'sombra', 'obscuridade', 'breu', 'negrume', 'escurecimento', 'silhueta'],
      'luz': ['brilho', 'claridade', 'luminosidade', 'fulgor', 'resplendor', 'clarão', 'lume', 'iluminação'],
      'silêncio': ['quietude', 'mutismo', 'repouso', 'calma', 'paz', 'tranquilidade', 'serenidade', 'imobilidade'],
      
      // Actions
      'correr': ['disparar', 'galpar', 'precipitar-se', 'apressar-se', 'voar', 'arremessar-se', 'lançar-se', 'fugir'],
      'caminhar': ['perambular', 'deambular', 'passear', 'marchar', 'avançar', 'progredir', 'transitar', 'desfilar'],
      'falar': ['proferir', 'articular', 'pronunciar', 'expressar', 'comunicar', 'dialogar', 'conversar', 'discursar'],
      'olhar': ['contemplar', 'observar', 'fixar', 'vislumbrar', 'encarar', 'perscrutar', 'examinar', 'avistar'],
      'ouvir': ['escutar', 'auscultar', 'perceber', 'apanhar', 'captar', 'atender', 'prestar atenção', 'obedecer'],
      
      // Nature
      'chuva': ['precipitação', 'aguaceiro', 'temporal', 'chuvisco', 'dilúvio', 'chuvarada', 'garoa', 'neblina'],
      'vento': ['brisa', 'ventania', 'rajada', 'sopro', 'corrente de ar', 'tufão', 'furacão', 'zéfiro'],
      'fogo': ['chama', 'incêndio', 'fogueira', 'brasas', 'labaredas', 'queimação', 'ardor', 'combustão'],
      'água': ['líquido', 'fluido', 'corrente', 'torrente', 'onda', 'maré', 'caudal', 'fluxo'],
      'árvore': ['arvoredo', 'floresta', 'mata', 'bosque', 'selva', 'vegetação', 'copado', 'frondoso'],
      
      // Time
      'noite': ['escuridão', 'anoitecer', 'madrugada', 'crepúsculo', 'alvorada', 'aurora', 'amanhecer', 'entardecer'],
      'dia': ['claridade', 'luz solar', 'amanhecer', 'meio-dia', 'tarde', 'crepúsculo', 'iluminação', 'brilho'],
      'rápido': ['veloz', 'acelerado', 'precipitado', 'célere', 'ligeiro', 'expedito', 'ágil', 'rápido'],
      'lento': ['moroso', 'vagaroso', 'preguiçoso', 'indolente', 'letárgico', 'pachorrento', 'arrastado', 'demorado'],
    };

    // Find matching suggestions
    let results: string[] = [];
    
    for (const [key, values] of Object.entries(languageSuggestions)) {
      if (key.includes(term_lower) || term_lower.includes(key)) {
        results = [...results, ...values];
      }
    }

    // If no exact match, search in all values
    if (results.length === 0) {
      for (const values of Object.values(languageSuggestions)) {
        results = [...results, ...values.filter(v => v.includes(term_lower))];
      }
    }

    // Remove duplicates and return
    return Array.from(new Set(results)).slice(0, 12);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Copiado!',
      description: `"${text}" foi copiado para a área de transferência.`,
    });
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateAiSuggestions()}
                  placeholder="Buscar sugestões ou tipo de linguagem..."
                  className="pl-10 bg-background border-primary/20 text-foreground"
                />
              </div>
              <Button 
                onClick={generateAiSuggestions}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Sugestões IA
              </Button>
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

          {/* AI Suggestions */}
          {showAiSuggestions && aiSuggestions.length > 0 && (
            <Card className="bg-graphite border-secondary/30 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  Sugestões de IA para "{searchTerm}"
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => copyToClipboard(suggestion, index)}
                    className="p-3 bg-background border border-secondary/30 rounded-lg hover:border-secondary/60 hover:bg-secondary/10 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-paragraph text-foreground group-hover:text-secondary">
                        {suggestion}
                      </span>
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-secondary ml-2 flex-shrink-0" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground/40 group-hover:text-secondary ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

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
