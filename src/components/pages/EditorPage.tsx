import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Stories, Personagens, EventosdaLinhadoTempo } from '@/entities';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStoryStore } from '@/stores/storyStore';
import { Plus, Save, BookOpen, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditorPage() {
  const { member } = useMember();
  const { toast } = useToast();
  const { activeStory, setActiveStory } = useStoryStore();
  
  const [stories, setStories] = useState<Stories[]>([]);
  const [characters, setCharacters] = useState<Personagens[]>([]);
  const [events, setEvents] = useState<EventosdaLinhadoTempo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewStory, setShowNewStory] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);
  const [assistanceType, setAssistanceType] = useState<'technical' | 'narrative'>('technical');
  const [assistanceResults, setAssistanceResults] = useState<string[]>([]);
  
  const [newStory, setNewStory] = useState({
    title: '',
    synopsis: '',
  });

  const [editContent, setEditContent] = useState({
    storyContent: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeStory) {
      setEditContent({
        storyContent: activeStory.storyContent || '',
      });
      loadStoryCharacters();
      loadStoryEvents();
    }
  }, [activeStory]);

  const loadData = async () => {
    try {
      const { items } = await BaseCrudService.getAll<Stories>('historias');
      setStories(items);
      if (items.length > 0 && !activeStory) {
        setActiveStory(items[0]);
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar histórias',
        description: 'Não foi possível carregar suas histórias.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStoryCharacters = async () => {
    if (!activeStory) return;
    try {
      const { items } = await BaseCrudService.getAll<Personagens>('personagens', ['historias']);
      const storyCharacters = items.filter(char => 
        char.historias?.some(story => story._id === activeStory._id)
      );
      setCharacters(storyCharacters);
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const loadStoryEvents = async () => {
    if (!activeStory) return;
    try {
      const { items } = await BaseCrudService.getAll<EventosdaLinhadoTempo>('eventosdalinhadotempo', ['historias']);
      const storyEvents = items.filter(event => 
        event.historias?.some(story => story._id === activeStory._id)
      );
      setEvents(storyEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleCreateStory = async () => {
    if (!newStory.title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Por favor, insira um título para a história.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const story: Stories = {
        _id: crypto.randomUUID(),
        title: newStory.title,
        synopsis: newStory.synopsis,
        storyContent: '',
        authorId: member?.loginEmail || '',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'Em Progresso',
      };

      await BaseCrudService.create('historias', story);
      await loadData();
      setActiveStory(story);
      setNewStory({ title: '', synopsis: '' });
      setShowNewStory(false);
      
      toast({
        title: 'História criada!',
        description: 'Sua nova história foi criada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar história',
        description: 'Não foi possível criar a história.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveContent = async () => {
    if (!activeStory) return;

    try {
      await BaseCrudService.update<Stories>('historias', {
        _id: activeStory._id,
        storyContent: editContent.storyContent,
        lastUpdatedAt: new Date().toISOString(),
      });

      const updatedStory = { ...activeStory, storyContent: editContent.storyContent };
      setActiveStory(updatedStory);
      
      toast({
        title: 'Salvo!',
        description: 'Seu conteúdo foi salvo com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o conteúdo.',
        variant: 'destructive',
      });
    }
  };

  const runAssistance = () => {
    const content = editContent.storyContent;
    const results: string[] = [];

    if (assistanceType === 'technical') {
      // Simulação de revisão técnica
      if (content.includes('  ')) {
        results.push('Espaços duplos detectados - verifique formatação');
      }
      if (!/[.!?]$/.test(content.trim()) && content.trim().length > 0) {
        results.push('Texto pode estar incompleto - falta pontuação final');
      }
      if (content.split('\n\n').length < 2 && content.length > 200) {
        results.push('Considere dividir em parágrafos para melhor legibilidade');
      }
      if (results.length === 0) {
        results.push('Nenhum problema técnico detectado');
      }
    } else {
      // Simulação de análise narrativa
      const characterNames = characters.map(c => c.name?.toLowerCase());
      const mentionedChars = characterNames.filter(name => 
        name && content.toLowerCase().includes(name)
      );
      
      if (mentionedChars.length === 0 && characters.length > 0) {
        results.push('Nenhum personagem da história foi mencionado neste trecho');
      }
      
      if (content.length < 100) {
        results.push('Trecho muito curto - considere desenvolver mais a cena');
      }
      
      if (results.length === 0) {
        results.push('Narrativa coerente - continue desenvolvendo!');
      }
    }

    setAssistanceResults(results);
  };

  const insertLink = (type: 'character' | 'event', id: string, name: string) => {
    const link = `[${name}](#${type}:${id})`;
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editContent.storyContent;
      const newText = text.substring(0, start) + link + text.substring(end);
      setEditContent({ storyContent: newText });
    }
  };

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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground">Editor de Histórias</h1>
            <Dialog open={showNewStory} onOpenChange={setShowNewStory}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova História
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-graphite border-primary/20">
                <DialogHeader>
                  <DialogTitle className="text-foreground font-heading">Criar Nova História</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Título</label>
                    <Input
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      placeholder="Digite o título da história"
                      className="bg-background border-primary/20 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Sinopse</label>
                    <Textarea
                      value={newStory.synopsis}
                      onChange={(e) => setNewStory({ ...newStory, synopsis: e.target.value })}
                      placeholder="Descreva brevemente sua história"
                      className="bg-background border-primary/20 text-foreground min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleCreateStory} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Criar História
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-graphite border-primary/20 p-4">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Minhas Histórias</h3>
                {stories.length === 0 ? (
                  <p className="text-foreground/60 font-paragraph text-sm">Nenhuma história criada ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {stories.map((story) => (
                      <button
                        key={story._id}
                        onClick={() => setActiveStory(story)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeStory?._id === story._id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-primary/10 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 flex-shrink-0" />
                          <span className="font-paragraph text-sm truncate">{story.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {activeStory && (
                <>
                  <Card className="bg-graphite border-primary/20 p-4">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Personagens</h3>
                    {characters.length === 0 ? (
                      <p className="text-foreground/60 font-paragraph text-sm">Nenhum personagem nesta história.</p>
                    ) : (
                      <div className="space-y-2">
                        {characters.map((char) => (
                          <button
                            key={char._id}
                            onClick={() => insertLink('character', char._id, char.name || 'Personagem')}
                            className="w-full text-left p-2 rounded-lg bg-background hover:bg-primary/10 text-foreground font-paragraph text-sm transition-colors"
                          >
                            {char.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="bg-graphite border-primary/20 p-4">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Eventos</h3>
                    {events.length === 0 ? (
                      <p className="text-foreground/60 font-paragraph text-sm">Nenhum evento nesta história.</p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((event) => (
                          <button
                            key={event._id}
                            onClick={() => insertLink('event', event._id, event.eventName || 'Evento')}
                            className="w-full text-left p-2 rounded-lg bg-background hover:bg-primary/10 text-foreground font-paragraph text-sm transition-colors"
                          >
                            {event.eventName}
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
              {!activeStory ? (
                <Card className="bg-graphite border-primary/20 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                    Nenhuma história selecionada
                  </h3>
                  <p className="text-foreground/60 font-paragraph mb-6">
                    Selecione uma história existente ou crie uma nova para começar a escrever.
                  </p>
                  <Button onClick={() => setShowNewStory(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira História
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-graphite border-primary/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-heading font-bold text-foreground">{activeStory.title}</h2>
                        {activeStory.synopsis && (
                          <p className="text-foreground/60 font-paragraph text-sm mt-1">{activeStory.synopsis}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={showAssistance} onOpenChange={setShowAssistance}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                              <HelpCircle className="w-4 h-4 mr-2" />
                              Assistência
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-graphite border-primary/20 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-foreground font-heading">Assistência de Escrita</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Tipo de Análise</label>
                                <Select value={assistanceType} onValueChange={(value: 'technical' | 'narrative') => setAssistanceType(value)}>
                                  <SelectTrigger className="bg-background border-primary/20 text-foreground">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-graphite border-primary/20">
                                    <SelectItem value="technical">Revisão Técnica</SelectItem>
                                    <SelectItem value="narrative">Análise Narrativa</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={runAssistance} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                Analisar Texto
                              </Button>
                              {assistanceResults.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-heading font-semibold text-foreground">Resultados:</h4>
                                  {assistanceResults.map((result, index) => (
                                    <div key={index} className="flex items-start gap-2 p-3 bg-background rounded-lg">
                                      {result.includes('Nenhum') || result.includes('coerente') ? (
                                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                      )}
                                      <p className="text-foreground/80 font-paragraph text-sm">{result}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button onClick={handleSaveContent} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-graphite border-primary/20 p-6">
                    <Textarea
                      value={editContent.storyContent}
                      onChange={(e) => setEditContent({ storyContent: e.target.value })}
                      placeholder="Comece a escrever sua história aqui... Use os botões na barra lateral para inserir links para personagens e eventos."
                      className="bg-background border-primary/20 text-foreground font-paragraph min-h-[600px] resize-none"
                    />
                    <p className="text-foreground/40 font-paragraph text-xs mt-2">
                      Dica: Clique em um personagem ou evento na barra lateral para inserir um link no texto.
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
