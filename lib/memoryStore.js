// Simple global in-memory store fallback when MongoDB is not connected
if (!global.memoryProjects) {
  global.memoryProjects = [];
}

export function saveInMemoryProject(projectData) {
  const _id = 'mem_' + Date.now() + Math.random().toString(36).substr(2, 6);
  const project = {
    ...projectData,
    _id,
    createdAt: new Date().toISOString(),
  };
  global.memoryProjects.unshift(project);
  return project;
}

export function getInMemoryProjects() {
  return global.memoryProjects || [];
}

export function getInMemoryProjectById(id) {
  return (global.memoryProjects || []).find(p => p._id === id);
}

export function updateInMemoryProject(id, updateData) {
  const idx = (global.memoryProjects || []).findIndex(p => p._id === id);
  if (idx !== -1) {
    global.memoryProjects[idx] = { ...global.memoryProjects[idx], ...updateData };
    return global.memoryProjects[idx];
  }
  return null;
}
