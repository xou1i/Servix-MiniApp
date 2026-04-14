export const generateGroupId = (productId, modifiers = [], notes = "") => {
  // Sort modifiers by type and value to ensure consistent hashing regardless of selection order
  const sortedModifiers = [...modifiers].sort((a, b) => 
    `${a.type}-${a.value}`.localeCompare(`${b.type}-${b.value}`)
  );
  
  const modifiersString = sortedModifiers.map(m => `${m.type}:${m.value}`).join('|');
  const normalizedNotes = notes.trim().toLowerCase();
  
  return `${productId}__mods[${modifiersString}]__notes[${normalizedNotes}]`;
};
