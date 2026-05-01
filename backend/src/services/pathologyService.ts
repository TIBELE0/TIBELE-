import prisma from '../config/prisma';
import { createSlug } from '../utils/validators';

const withLegacyId = <T extends { id: string }>(row: T) => ({ ...row, _id: row.id });

export const pathologyService = {
  async getAllPathologies(page: number = 1, limit: number = 10, includeHidden = false): Promise<{ pathologies: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const where = includeHidden ? {} : { isHidden: false };
    const [pathologies, total] = await Promise.all([
      prisma.pathology.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pathology.count({ where }),
    ]);

    return { pathologies: pathologies.map(withLegacyId), total };
  },

  async getPathologyBySlug(slug: string): Promise<any | null> {
    const pathology = await prisma.pathology.findFirst({ where: { slug, isHidden: false } });
    return pathology ? withLegacyId(pathology) : null;
  },

  async searchPathologies(query: string): Promise<any[]> {
    const pathologies = await prisma.pathology.findMany({
      where: {
        isHidden: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { definition: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return pathologies.map(withLegacyId);
  },

  async createPathology(data: any): Promise<any> {
    const slug = createSlug(data.title || '');

    // Check if slug already exists
    const existing = await prisma.pathology.findUnique({ where: { slug } });
    if (existing) {
      throw new Error('Pathology with this title already exists');
    }

    const pathology = await prisma.pathology.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        definition: data.definition,
        examinations: data.examinations,
        referentialDiagnosis: data.referentialDiagnosis,
        onSiteTreatment: data.onSiteTreatment,
        dischargeOrder: data.dischargeOrder,
        prevention: data.prevention,
        references: data.references,
        imageUrl: data.imageUrl,
        isFree: Boolean(data.isFree),
        isHidden: Boolean(data.isHidden),
        groupe: data.groupe || 'Autres',
      },
    });

    return withLegacyId(pathology);
  },

  async updatePathology(id: string, data: any): Promise<any | null> {
    const updateData: Record<string, unknown> = {
      ...data,
    };

    // If title is updated, regenerate slug
    if (data.title) {
      updateData.slug = createSlug(data.title);
    }

    try {
      const pathology = await prisma.pathology.update({
        where: { id },
        data: updateData,
      });
      return withLegacyId(pathology);
    } catch {
      return null;
    }
  },

  async deletePathology(id: string): Promise<void> {
    await prisma.pathology.delete({ where: { id } });
  },

  async getGroupes(): Promise<{ nom: string; count: number }[]> {
    const [groups, grouped] = await Promise.all([
      prisma.medicalGroup.findMany({ orderBy: { name: 'asc' } }),
      prisma.pathology.groupBy({ by: ['groupe'], where: { isHidden: false }, _count: { _all: true } }),
    ]);

    const countMap = new Map(grouped.map((r) => [String(r.groupe || 'Autres'), Number(r._count._all || 0)]));
    const fromGroups = groups.map((g) => ({ nom: g.name, count: countMap.get(g.name) || 0 }));

    grouped.forEach((r) => {
      const name = String(r.groupe || 'Autres');
      if (!fromGroups.some((g) => g.nom === name)) {
        fromGroups.push({ nom: name, count: Number(r._count._all || 0) });
      }
    });

    return fromGroups;
  },

  async getPathologiesByGroupe(
    groupe: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ pathologies: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [pathologies, total] = await Promise.all([
      prisma.pathology.findMany({
        where: { groupe, isHidden: false },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          isFree: true,
          groupe: true,
        },
        orderBy: { title: 'asc' },
        skip,
        take: limit,
      }),
      prisma.pathology.count({ where: { groupe, isHidden: false } }),
    ]);

    return { pathologies: pathologies.map(withLegacyId), total };
  },

  async getPathologyContent(pathology: any, isPaid: boolean): Promise<any> {
    if (pathology.isFree || isPaid) {
      return pathology;
    }

    // Return truncated content for non-paid users
    return {
      ...pathology,
      definition: pathology.definition.substring(0, 200) + '...',
      examinations: null,
      referentialDiagnosis: null,
      onSiteTreatment: null,
      dischargeOrder: null,
      prevention: null,
      isLocked: true,
    };
  },
};
