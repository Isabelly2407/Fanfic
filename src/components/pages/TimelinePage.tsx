import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { EventosdaLinhadoTempo, Personagens, Stories } from '@/entities';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStoryStore } from '@/stores/storyStore';
import { Plus, Clock, Download, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function TimelinePage() {
  const { toast } = useToast();
  const { activeStory, setActiveStory } = useStoryStore();
  
  const [stories, setStories] = useState<Stories[]>([]);
  const [events, setEvents] = useState<EventosdaLinhadoTempo[]>([]);
  const [characters, setCharacters] = useState<Personagens[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eraName: '',
    characterIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeStory) {
      loadTimelineData();
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

  const loadTimelineData = async () => {
    if (!activeStory) return;
    try {
      const { items: eventItems } = await BaseCrudService.getAll<EventosdaLinhadoTempo>('eventosdalinhadotempo', ['historias', 'personagens']);
      const storyEvents = eventItems.filter(event => 
        event.historias?.some(story => story._id === activeStory._id)
      );
      setEvents(storyEvents.sort((a, b) => {
        if (!a.eventDate || !b.eventDate) return 0;
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }));

      const { items: charItems } = await BaseCrudService.getAll<Personagens>('personagens', ['historias']);
      const storyCharacters = charItems.filter(char => 
        char.historias?.some(story => story._id === activeStory._id)
      );
      setCharacters(storyCharacters);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados da linha do tempo.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.eventName || !formData.eventDate || !activeStory) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o nome e a data do evento.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const event: EventosdaLinhadoTempo = {
        _id: crypto.randomUUID(),
        eventName: formData.eventName,
        eventDescription: formData.eventDescription,
        eventDate: formData.eventDate,
        eraName: formData.eraName,
        storyId: activeStory._id,
        characterIds: formData.characterIds.join(','),
      };

      await BaseCrudService.create(
        'eventosdalinhadotempo',
        event,
        { 
          historias: [activeStory._id],
          personagens: formData.characterIds
        }
      );
      
      await loadTimelineData();
      setFormData({
        eventName: '',
        eventDescription: '',
        eventDate: '',
        eraName: '',
        characterIds: [],
      });
      setShowNewEvent(false);
      
      toast({
        title: 'Evento criado!',
        description: 'O evento foi adicionado à linha do tempo.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar evento',
        description: 'Não foi possível criar o evento.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await BaseCrudService.delete('eventosdalinhadotempo', eventToDelete);
      await loadTimelineData();
      setShowDeleteDialog(false);
      setEventToDelete(null);
      
      toast({
        title: 'Evento deletado!',
        description: 'O evento foi removido da linha do tempo.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao deletar evento',
        description: 'Não foi possível deletar o evento.',
        variant: 'destructive',
      });
    }
  };

  const exportTimeline = () => {
    toast({
      title: 'Exportação em desenvolvimento',
      description: 'A funcionalidade de exportação será implementada em breve.',
    });
  };

  const getUniqueEras = () => {
    const eras = events.map(e => e.eraName).filter(Boolean);
    return Array.from(new Set(eras));
  };

  const filteredEvents = selectedEra === 'all' 
    ? events 
    : events.filter(e => e.eraName === selectedEra);

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
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground">Linha do Tempo</h1>
              {activeStory && (
                <p className="text-foreground/60 font-paragraph mt-2">História: {activeStory.title}</p>
              )}
            </div>
            <div className="flex gap-4">
              {stories.length > 1 && (
                <Select value={activeStory?._id} onValueChange={(id) => {
                  const story = stories.find(s => s._id === id);
                  if (story) setActiveStory(story);
                }}>
                  <SelectTrigger className="w-64 bg-graphite border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecione uma história" />
                  </SelectTrigger>
                  <SelectContent className="bg-graphite border-primary/20">
                    {stories.map((story) => (
                      <SelectItem key={story._id} value={story._id}>
                        {story.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={exportTimeline} variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-graphite border-primary/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-heading">Criar Novo Evento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Nome do Evento *</label>
                      <Input
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                        placeholder="Ex: Nascimento de Elena"
                        className="bg-background border-primary/20 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Data do Evento *</label>
                      <Input
                        type="datetime-local"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="bg-background border-primary/20 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Era</label>
                      <Input
                        value={formData.eraName}
                        onChange={(e) => setFormData({ ...formData, eraName: e.target.value })}
                        placeholder="Ex: Era Antiga, Era Moderna"
                        className="bg-background border-primary/20 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Personagens Envolvidos</label>
                      <Select 
                        value={formData.characterIds[0] || ''} 
                        onValueChange={(value) => {
                          if (!formData.characterIds.includes(value)) {
                            setFormData({ ...formData, characterIds: [...formData.characterIds, value] });
                          }
                        }}
                      >
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <SelectValue placeholder="Adicionar personagem" />
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          {characters.map((char) => (
                            <SelectItem key={char._id} value={char._id}>
                              {char.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.characterIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.characterIds.map((charId) => {
                            const char = characters.find(c => c._id === charId);
                            return (
                              <div key={charId} className="bg-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="text-sm font-paragraph text-foreground">{char?.name}</span>
                                <button
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    characterIds: formData.characterIds.filter(id => id !== charId) 
                                  })}
                                  className="text-foreground/60 hover:text-foreground"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Descrição</label>
                      <Textarea
                        value={formData.eventDescription}
                        onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                        placeholder="Descreva o que aconteceu neste evento"
                        className="bg-background border-primary/20 text-foreground min-h-[100px]"
                      />
                    </div>
                    <Button onClick={handleCreateEvent} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Criar Evento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {!activeStory ? (
            <Card className="bg-graphite border-primary/20 p-12 text-center">
              <Clock className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                Nenhuma história selecionada
              </h3>
              <p className="text-foreground/60 font-paragraph">
                Selecione uma história para visualizar sua linha do tempo.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Era Filter */}
              {getUniqueEras().length > 0 && (
                <Card className="bg-graphite border-primary/20 p-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-paragraph text-foreground/70">Filtrar por Era:</label>
                    <Select value={selectedEra} onValueChange={setSelectedEra}>
                      <SelectTrigger className="w-64 bg-background border-primary/20 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-graphite border-primary/20">
                        <SelectItem value="all">Todas as Eras</SelectItem>
                        {getUniqueEras().map((era) => (
                          <SelectItem key={era} value={era || ''}>
                            {era}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              )}

              {/* Timeline */}
              {filteredEvents.length === 0 ? (
                <Card className="bg-graphite border-primary/20 p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                    Nenhum evento ainda
                  </h3>
                  <p className="text-foreground/60 font-paragraph mb-6">
                    Comece criando seu primeiro evento para esta história.
                  </p>
                  <Button onClick={() => setShowNewEvent(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Evento
                  </Button>
                </Card>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30" />

                  <div className="space-y-8">
                    {filteredEvents.map((event, index) => (
                      <div key={event._id} className="relative pl-20">
                        {/* Timeline Dot */}
                        <div className="absolute left-6 top-6 w-5 h-5 bg-primary rounded-full border-4 border-background" />

                        <Card className="bg-graphite border-primary/20 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-heading font-semibold text-foreground">
                                  {event.eventName}
                                </h3>
                                {event.eraName && (
                                  <span className="px-3 py-1 bg-secondary/20 rounded-full text-xs font-paragraph text-secondary">
                                    {event.eraName}
                                  </span>
                                )}
                              </div>
                              {event.eventDate && (
                                <p className="text-sm font-paragraph text-foreground/60 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {format(new Date(event.eventDate), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEventToDelete(event._id);
                                setShowDeleteDialog(true);
                              }}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {event.eventDescription && (
                            <p className="text-foreground/80 font-paragraph mb-4">{event.eventDescription}</p>
                          )}

                          {event.personagens && event.personagens.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs font-paragraph text-foreground/60">Personagens:</span>
                              {event.personagens.map((char) => (
                                <span key={char._id} className="px-3 py-1 bg-primary/20 rounded-full text-xs font-paragraph text-primary">
                                  {char.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-graphite border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-heading flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Deletar Evento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-primary/20 text-foreground hover:bg-primary/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
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
