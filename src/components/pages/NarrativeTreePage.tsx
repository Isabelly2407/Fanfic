import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { Personagens, CharacterRelationships, Stories } from '@/entities';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStoryStore } from '@/stores/storyStore';
import { Plus, GitBranch, Download, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function NarrativeTreePage() {
  const { toast } = useToast();
  const { activeStory, setActiveStory } = useStoryStore();
  
  const [stories, setStories] = useState<Stories[]>([]);
  const [characters, setCharacters] = useState<Personagens[]>([]);
  const [relationships, setRelationships] = useState<CharacterRelationships[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRelationship, setShowNewRelationship] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [relationshipToDelete, setRelationshipToDelete] = useState<string | null>(null);
  const [showReincarnationDialog, setShowReincarnationDialog] = useState(false);
  const [reincarnationData, setReincarnationData] = useState({
    characterId: '',
    reincarnationCharacterId: '',
  });
  
  const [formData, setFormData] = useState({
    characterOneId: '',
    characterTwoId: '',
    relationshipType: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeStory) {
      loadTreeData();
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

  const loadTreeData = async () => {
    if (!activeStory) return;
    try {
      const { items: charItems } = await BaseCrudService.getAll<Personagens>('personagens', ['historias']);
      const storyCharacters = charItems.filter(char => 
        char.historias?.some(story => story._id === activeStory._id)
      );
      setCharacters(storyCharacters);

      const { items: relItems } = await BaseCrudService.getAll<CharacterRelationships>('relacoesdepersonagens', ['historias', 'personagens']);
      const storyRelationships = relItems.filter(rel => 
        rel.historias?.some(story => story._id === activeStory._id)
      );
      setRelationships(storyRelationships);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados da árvore.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateRelationship = async () => {
    if (!formData.characterOneId || !formData.characterTwoId || !formData.relationshipType || !activeStory) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const relationship: CharacterRelationships = {
        _id: crypto.randomUUID(),
        characterOneId: formData.characterOneId,
        characterTwoId: formData.characterTwoId,
        relationshipType: formData.relationshipType,
        description: formData.description,
        storyId: activeStory._id,
      };

      await BaseCrudService.create(
        'relacoesdepersonagens',
        relationship,
        { 
          historias: [activeStory._id],
          personagens: [formData.characterOneId, formData.characterTwoId]
        }
      );
      
      await loadTreeData();
      setFormData({
        characterOneId: '',
        characterTwoId: '',
        relationshipType: '',
        description: '',
      });
      setShowNewRelationship(false);
      
      toast({
        title: 'Relação criada!',
        description: 'A relação entre personagens foi adicionada.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar relação',
        description: 'Não foi possível criar a relação.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRelationship = async () => {
    if (!relationshipToDelete) return;
    
    try {
      await BaseCrudService.delete('relacoesdepersonagens', relationshipToDelete);
      await loadTreeData();
      setShowDeleteDialog(false);
      setRelationshipToDelete(null);
      
      toast({
        title: 'Relação removida!',
        description: 'A relação foi deletada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao deletar relação',
        description: 'Não foi possível deletar a relação.',
        variant: 'destructive',
      });
    }
  };

  const handleAddReincarnation = async () => {
    if (!reincarnationData.characterId || !reincarnationData.reincarnationCharacterId || !activeStory) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione ambos os personagens.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create reincarnation relationship
      const relationship: CharacterRelationships = {
        _id: crypto.randomUUID(),
        characterOneId: reincarnationData.characterId,
        characterTwoId: reincarnationData.reincarnationCharacterId,
        relationshipType: 'Reencarnação',
        description: 'Reencarnação de uma vida anterior',
        storyId: activeStory._id,
      };

      await BaseCrudService.create(
        'relacoesdepersonagens',
        relationship,
        { 
          historias: [activeStory._id],
          personagens: [reincarnationData.characterId, reincarnationData.reincarnationCharacterId]
        }
      );

      // Update the character's alternativeversionof field
      const character = characters.find(c => c._id === reincarnationData.characterId);
      if (character) {
        await BaseCrudService.update('personagens', {
          _id: reincarnationData.characterId,
          alternativeversionof: reincarnationData.reincarnationCharacterId,
        });
      }
      
      await loadTreeData();
      setReincarnationData({
        characterId: '',
        reincarnationCharacterId: '',
      });
      setShowReincarnationDialog(false);
      
      toast({
        title: 'Reencarnação adicionada!',
        description: 'A reencarnação foi vinculada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao adicionar reencarnação',
        description: 'Não foi possível adicionar a reencarnação.',
        variant: 'destructive',
      });
    }
  };

  const exportTree = () => {
    toast({
      title: 'Exportação em desenvolvimento',
      description: 'A funcionalidade de exportação será implementada em breve.',
    });
  };

  const getCharacterName = (id: string) => {
    const char = characters.find(c => c._id === id);
    return char?.name || 'Desconhecido';
  };

  const getCharacterRelationships = (characterId: string) => {
    return relationships.filter(rel => 
      rel.characterOneId === characterId || rel.characterTwoId === characterId
    );
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
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground">Árvore Narrativa</h1>
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
              <Button onClick={exportTree} variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            <div className="flex gap-4">
              <Dialog open={showReincarnationDialog} onOpenChange={setShowReincarnationDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Reencarnação
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-graphite border-primary/20">
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-heading">Adicionar Reencarnação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Personagem Original *</label>
                      <Select value={reincarnationData.characterId} onValueChange={(value) => setReincarnationData({ ...reincarnationData, characterId: value })}>
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <SelectValue placeholder="Selecione o personagem original" />
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          {characters.map((char) => (
                            <SelectItem key={char._id} value={char._id}>
                              {char.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Reencarnação *</label>
                      <Select value={reincarnationData.reincarnationCharacterId} onValueChange={(value) => setReincarnationData({ ...reincarnationData, reincarnationCharacterId: value })}>
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <SelectValue placeholder="Selecione a reencarnação" />
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          {characters.map((char) => (
                            <SelectItem key={char._id} value={char._id}>
                              {char.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddReincarnation} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Vincular Reencarnação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showNewRelationship} onOpenChange={setShowNewRelationship}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Relação
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-graphite border-primary/20">
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-heading">Criar Nova Relação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Personagem 1 *</label>
                      <Select value={formData.characterOneId} onValueChange={(value) => setFormData({ ...formData, characterOneId: value })}>
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <SelectValue placeholder="Selecione o primeiro personagem" />
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          {characters.map((char) => (
                            <SelectItem key={char._id} value={char._id}>
                              {char.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Personagem 2 *</label>
                      <Select value={formData.characterTwoId} onValueChange={(value) => setFormData({ ...formData, characterTwoId: value })}>
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <SelectValue placeholder="Selecione o segundo personagem" />
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          {characters.map((char) => (
                            <SelectItem key={char._id} value={char._id}>
                              {char.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Tipo de Relação *</label>
                      <Select value={formData.relationshipType} onValueChange={(value) => setFormData({ ...formData, relationshipType: value })}>
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          <SelectItem value="Familiar">Familiar</SelectItem>
                          <SelectItem value="Pai/Mãe">Pai/Mãe</SelectItem>
                          <SelectItem value="Filho/Filha">Filho/Filha</SelectItem>
                          <SelectItem value="Irmão/Irmã">Irmão/Irmã</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Amizade">Amizade</SelectItem>
                          <SelectItem value="Inimizade">Inimizade</SelectItem>
                          <SelectItem value="Romântica">Romântica</SelectItem>
                          <SelectItem value="Espiritual">Espiritual</SelectItem>
                          <SelectItem value="Mentor/Aprendiz">Mentor/Aprendiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Descrição</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva a relação entre os personagens"
                        className="bg-background border-primary/20 text-foreground min-h-[100px]"
                      />
                    </div>
                    <Button onClick={handleCreateRelationship} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Criar Relação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            </div>
          </div>

          {!activeStory ? (
            <Card className="bg-graphite border-primary/20 p-12 text-center">
              <GitBranch className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                Nenhuma história selecionada
              </h3>
              <p className="text-foreground/60 font-paragraph">
                Selecione uma história para visualizar sua árvore narrativa.
              </p>
            </Card>
          ) : characters.length === 0 ? (
            <Card className="bg-graphite border-primary/20 p-12 text-center">
              <GitBranch className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                Nenhum personagem ainda
              </h3>
              <p className="text-foreground/60 font-paragraph">
                Crie personagens na página de Personagens para começar a construir sua árvore narrativa.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Visual Tree Representation */}
              <Card className="bg-graphite border-primary/20 p-8">
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">Visualização da Árvore</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((character) => {
                    const charRelationships = getCharacterRelationships(character._id);
                    return (
                      <div key={character._id} className="bg-background rounded-lg p-6 border-2 border-primary/30">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-heading font-bold text-lg">
                              {character.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-heading font-semibold text-foreground">
                              {character.name}
                            </h3>
                            {character.versionName && (
                              <p className="text-xs font-paragraph text-secondary">{character.versionName}</p>
                            )}
                          </div>
                        </div>
                        
                        {charRelationships.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-paragraph text-foreground/60 mb-2">Relações:</p>
                            {charRelationships.map((rel) => {
                              const otherCharId = rel.characterOneId === character._id ? rel.characterTwoId : rel.characterOneId;
                              return (
                                <div key={rel._id} className="bg-graphite/50 rounded p-2">
                                  <p className="text-sm font-paragraph text-foreground">
                                    <span className="text-primary font-semibold">{rel.relationshipType}</span>
                                    {' com '}
                                    <span className="text-secondary">{getCharacterName(otherCharId || '')}</span>
                                  </p>
                                  {rel.description && (
                                    <p className="text-xs font-paragraph text-foreground/60 mt-1">{rel.description}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm font-paragraph text-foreground/40">Sem relações definidas</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Relationships List */}
              <Card className="bg-graphite border-primary/20 p-8">
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">Todas as Relações</h2>
                {relationships.length === 0 ? (
                  <p className="text-foreground/60 font-paragraph text-center py-8">
                    Nenhuma relação criada ainda. Clique em "Nova Relação" para começar.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relationships.map((rel) => (
                      <div key={rel._id} className="bg-background rounded-lg p-6 border border-primary/20 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-paragraph text-foreground">
                              {getCharacterName(rel.characterOneId || '')}
                            </span>
                            <div className="px-4 py-1 bg-primary/20 rounded-full">
                              <span className="text-sm font-paragraph text-primary font-semibold">
                                {rel.relationshipType}
                              </span>
                            </div>
                            <span className="text-lg font-paragraph text-foreground">
                              {getCharacterName(rel.characterTwoId || '')}
                            </span>
                          </div>
                          {rel.description && (
                            <p className="text-sm font-paragraph text-foreground/70 mt-2">{rel.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRelationshipToDelete(rel._id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive hover:bg-destructive/10 ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-graphite border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-heading flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Deletar Relação
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              Tem certeza que deseja deletar esta relação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-primary/20 text-foreground hover:bg-primary/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRelationship}
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
