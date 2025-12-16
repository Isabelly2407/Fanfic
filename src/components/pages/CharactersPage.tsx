import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Personagens, Stories } from '@/entities';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStoryStore } from '@/stores/storyStore';
import { Plus, Edit, Trash2, Copy, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CharactersPage() {
  const { toast } = useToast();
  const { activeStory, setActiveStory } = useStoryStore();
  
  const [stories, setStories] = useState<Stories[]>([]);
  const [characters, setCharacters] = useState<Personagens[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCharacter, setShowNewCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Personagens | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    versionName: '',
    age: '',
    gender: '',
    appearance: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeStory) {
      loadCharacters();
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

  const loadCharacters = async () => {
    if (!activeStory) return;
    try {
      const { items } = await BaseCrudService.getAll<Personagens>('personagens', ['historias', 'alternativeversionof']);
      const storyCharacters = items.filter(char => 
        char.historias?.some(story => story._id === activeStory._id)
      );
      setCharacters(storyCharacters);
    } catch (error) {
      toast({
        title: 'Erro ao carregar personagens',
        description: 'Não foi possível carregar os personagens.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      versionName: '',
      age: '',
      gender: '',
      appearance: '',
    });
    setEditingCharacter(null);
  };

  const handleEdit = (character: Personagens) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name || '',
      description: character.description || '',
      versionName: character.versionName || '',
      age: character.age?.toString() || '',
      gender: character.gender || '',
      appearance: character.appearance || '',
    });
    setShowNewCharacter(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !activeStory) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira um nome para o personagem.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCharacter) {
        await BaseCrudService.update<Personagens>('personagens', {
          _id: editingCharacter._id,
          name: formData.name,
          description: formData.description,
          versionName: formData.versionName,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          appearance: formData.appearance,
        });
        toast({
          title: 'Personagem atualizado!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        const character: Personagens = {
          _id: crypto.randomUUID(),
          name: formData.name,
          description: formData.description,
          versionName: formData.versionName,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          appearance: formData.appearance,
        };

        await BaseCrudService.create(
          'personagens',
          character,
          { historias: [activeStory._id] }
        );
        
        toast({
          title: 'Personagem criado!',
          description: 'O personagem foi adicionado à história.',
        });
      }

      await loadCharacters();
      resetForm();
      setShowNewCharacter(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o personagem.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) return;

    try {
      await BaseCrudService.delete('personagens', characterId);
      await loadCharacters();
      toast({
        title: 'Personagem excluído',
        description: 'O personagem foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o personagem.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyToStory = async (character: Personagens, targetStoryId: string) => {
    try {
      const newCharacter: Personagens = {
        _id: crypto.randomUUID(),
        name: character.name,
        description: character.description,
        versionName: `Cópia de ${character.versionName || 'versão original'}`,
        age: character.age,
        gender: character.gender,
        appearance: character.appearance,
        alternativeversionof: character,
      };

      await BaseCrudService.create(
        'personagens',
        { ...newCharacter, alternativeversionof: character._id },
        { historias: [targetStoryId] }
      );
      
      toast({
        title: 'Personagem copiado!',
        description: 'Uma versão alternativa foi criada na história selecionada.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o personagem.',
        variant: 'destructive',
      });
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
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground">Personagens</h1>
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
              <Dialog open={showNewCharacter} onOpenChange={(open) => {
                setShowNewCharacter(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Personagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-graphite border-primary/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-heading">
                      {editingCharacter ? 'Editar Personagem' : 'Criar Novo Personagem'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Nome *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do personagem"
                        className="bg-background border-primary/20 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Versão</label>
                      <Input
                        value={formData.versionName}
                        onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                        placeholder="Ex: Versão jovem, Versão adulta"
                        className="bg-background border-primary/20 text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Idade</label>
                        <Input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="Idade"
                          className="bg-background border-primary/20 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Gênero</label>
                        <Input
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          placeholder="Gênero"
                          className="bg-background border-primary/20 text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Descrição</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva o personagem, sua personalidade, história..."
                        className="bg-background border-primary/20 text-foreground min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-paragraph text-foreground/70 mb-2 block">Aparência</label>
                      <Textarea
                        value={formData.appearance}
                        onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                        placeholder="Descreva a aparência física do personagem"
                        className="bg-background border-primary/20 text-foreground min-h-[100px]"
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      {editingCharacter ? 'Salvar Alterações' : 'Criar Personagem'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {!activeStory ? (
            <Card className="bg-graphite border-primary/20 p-12 text-center">
              <User className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                Nenhuma história selecionada
              </h3>
              <p className="text-foreground/60 font-paragraph">
                Crie uma história no Editor para começar a adicionar personagens.
              </p>
            </Card>
          ) : characters.length === 0 ? (
            <Card className="bg-graphite border-primary/20 p-12 text-center">
              <User className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                Nenhum personagem ainda
              </h3>
              <p className="text-foreground/60 font-paragraph mb-6">
                Comece criando seu primeiro personagem para esta história.
              </p>
              <Button onClick={() => setShowNewCharacter(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Personagem
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <Card key={character._id} className="bg-graphite border-primary/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                        {character.name}
                      </h3>
                      {character.versionName && (
                        <p className="text-sm font-paragraph text-secondary">{character.versionName}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(character)}
                        size="icon"
                        variant="ghost"
                        className="text-foreground hover:bg-primary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(character._id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {character.age && (
                      <div>
                        <p className="text-xs font-paragraph text-foreground/60">Idade</p>
                        <p className="text-sm font-paragraph text-foreground">{character.age} anos</p>
                      </div>
                    )}
                    {character.gender && (
                      <div>
                        <p className="text-xs font-paragraph text-foreground/60">Gênero</p>
                        <p className="text-sm font-paragraph text-foreground">{character.gender}</p>
                      </div>
                    )}
                    {character.description && (
                      <div>
                        <p className="text-xs font-paragraph text-foreground/60">Descrição</p>
                        <p className="text-sm font-paragraph text-foreground line-clamp-3">{character.description}</p>
                      </div>
                    )}
                    {character.appearance && (
                      <div>
                        <p className="text-xs font-paragraph text-foreground/60">Aparência</p>
                        <p className="text-sm font-paragraph text-foreground line-clamp-2">{character.appearance}</p>
                      </div>
                    )}
                    {character.alternativeversionof && typeof character.alternativeversionof === 'object' && (
                      <div>
                        <p className="text-xs font-paragraph text-foreground/60">Versão alternativa de</p>
                        <p className="text-sm font-paragraph text-primary">{character.alternativeversionof.name}</p>
                      </div>
                    )}
                  </div>

                  {stories.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <Select onValueChange={(storyId) => handleCopyToStory(character, storyId)}>
                        <SelectTrigger className="bg-background border-primary/20 text-foreground">
                          <div className="flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            <span>Copiar para outra história</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-graphite border-primary/20">
                          {stories
                            .filter(s => s._id !== activeStory?._id)
                            .map((story) => (
                              <SelectItem key={story._id} value={story._id}>
                                {story.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
