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
import { Plus, Save, PenTool, AlertCircle, CheckCircle, BookOpen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function EditorPage() {
  const { member } = useMember();
  const { toast } = useToast();
  const { activeStory, setActiveStory } = useStoryStore();
  
  const [stories, setStories] = useState<Stories[]>([]);
  const [characters, setCharacters] = useState<Personagens[]>([]);
  const [events, setEvents] = useState<EventosdaLinhadoTempo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewStory, setShowNewStory] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  
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

  const handleDeleteStory = async () => {
    if (!storyToDelete) return;

    try {
      // Delete all relationships associated with this story
      const { items: relationships } = await BaseCrudService.getAll('relacoesdepersonagens');
      for (const rel of relationships) {
        if (rel.storyId === storyToDelete) {
          await BaseCrudService.delete('relacoesdepersonagens', rel._id);
        }
      }

      // Delete all events associated with this story
      const { items: events } = await BaseCrudService.getAll('eventosdalinhadotempo');
      for (const event of events) {
        if (event.storyId === storyToDelete) {
          await BaseCrudService.delete('eventosdalinhadotempo', event._id);
        }
      }

      // Delete the story itself
      await BaseCrudService.delete('historias', storyToDelete);
      
      await loadData();
      setShowDeleteDialog(false);
      setStoryToDelete(null);
      
      toast({
        title: 'História deletada!',
        description: 'A história e todos seus dados foram removidos.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao deletar história',
        description: 'Não foi possível deletar a história.',
        variant: 'destructive',
      });
    }
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
                      <div key={story._id} className="flex gap-2">
                        <button
                          onClick={() => setActiveStory(story)}
                          className={`flex-1 text-left p-3 rounded-lg transition-colors ${
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStoryToDelete(story._id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-graphite border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-heading flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Deletar História
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              Tem certeza que deseja deletar esta história? Todos os eventos, personagens e relações associadas também serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-primary/20 text-foreground hover:bg-primary/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
