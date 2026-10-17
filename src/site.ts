export const site = {
  name: 'Kikoe',
  title: 'Kikoe — Your conversations, turned into useful notes',
  description: 'Record meetings, import interviews, and turn audio into searchable, editable notes. Free and open source, with cloud transcription or local models on your computer.',
  repository: 'https://github.com/first-storm/Kikoe',
  install: [
    'flatpak remote-add --user --if-not-exists kikoe https://first-storm.github.io/Kikoe/kikoe.flatpakrepo',
    'flatpak install --user kikoe io.github.first_storm.Kikoe',
  ],
};
export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const local = (path = '') => `${base}${path.replace(/^\//, '')}`;
