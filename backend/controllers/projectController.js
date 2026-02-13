const { getProjects, getProjectById, addProject } = require('../config/store');

/**
 * List all projects.
 * Supports ?status= query param for filtering (case-insensitive).
 * E.g. ?status=active, ?status=in-progress, ?status=archived
 */
function listProjects(req, res, next) {
  try {
    let projects = getProjects();
    const status = req.query.status;
    if (status != null && String(status).trim() !== '') {
      projects = projects.filter(
        (p) => p.status && p.status.toLowerCase() === String(status).trim().toLowerCase()
      );
    }
    res.json({ success: true, data: projects, count: projects.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single project by ID.
 */
function getProject(req, res, next) {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        id: req.params.id,
      });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new project.
 */
function createProject(req, res, next) {
  try {
    const { name, chain, status } = req.body;
    const project = addProject({ name, chain, status: status || 'in-progress' });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
};
