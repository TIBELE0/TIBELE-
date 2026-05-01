import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pathologyService } from '../services/pathologyService';

export const getAllPathologies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const includeHidden = req.userRole === 'admin' && req.query.includeHidden === 'true';
    const { pathologies, total } = await pathologyService.getAllPathologies(page, limit, includeHidden);

    const processedPathologies = await Promise.all(
      pathologies.map(async (p) => pathologyService.getPathologyContent(p, true))
    );

    res.status(200).json({
      pathologies: processedPathologies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPathologyBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const pathology = await pathologyService.getPathologyBySlug(slug);

    if (!pathology) {
      res.status(404).json({ message: 'Pathology not found' });
      return;
    }

    const content = await pathologyService.getPathologyContent(pathology, true);
    res.status(200).json(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchPathologies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const pathologies = await pathologyService.searchPathologies(q);

    const processedPathologies = await Promise.all(
      pathologies.map(async (p) => pathologyService.getPathologyContent(p, true))
    );

    res.status(200).json({ pathologies: processedPathologies });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPathology = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pathology = await pathologyService.createPathology(req.body);
    res.status(201).json({ message: 'Pathology created', pathology });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePathology = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pathology = await pathologyService.updatePathology(id, req.body);
    res.status(200).json({ message: 'Pathology updated', pathology });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePathology = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pathologyService.deletePathology(id);
    res.status(200).json({ message: 'Pathology deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groupes = await pathologyService.getGroupes();
    res.status(200).json({ groupes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPathologiesByGroupe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { pathologies, total } = await pathologyService.getPathologiesByGroupe(
      decodeURIComponent(nom),
      page,
      limit
    );

    res.status(200).json({
      pathologies,
      groupe: decodeURIComponent(nom),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
