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
