import { Request, Response, NextFunction } from 'express';
import { RightToWorkModel } from '../models/rightToWorkModel';

export class RightToWorkController {
  /**
   * Create a new right-to-work verification record
   * POST /api/workers/right-to-work/records
   */
  static async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { employee_nr, name, share_status, documents_provided_at } = req.body;

      if (!employee_nr || !name) {
        res.status(400).json({ error: 'employee_nr and name are required' });
        return;
      }

      // Verify it's a valid employee number (2+ digits)
      if (!/^\d{2,}$/.test(String(employee_nr))) {
        res.status(400).json({ error: 'employee_nr must be a number with at least 2 digits (e.g., 01, 02)' });
        return;
      }

      // Check for duplicates
      const existing = await RightToWorkModel.findByWorkerAndEmployeeNr(
        req.user.userId,
        String(employee_nr).padStart(2, '0')
      );

      if (existing) {
        res.status(409).json({ error: 'Employee number already exists for this worker' });
        return;
      }

      const record = await RightToWorkModel.create({
        worker_id: req.user.userId,
        employee_nr: String(employee_nr).padStart(2, '0'),
        name,
        share_status: share_status || 'not_verified',
        documents_provided_at: documents_provided_at ? new Date(documents_provided_at) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Right-to-work record created successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all right-to-work records for a worker
   * GET /api/workers/right-to-work/records
   */
  static async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const records = await RightToWorkModel.findByWorkerId(req.user.userId);

      res.status(200).json({
        success: true,
        data: records,
        count: records.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific right-to-work record
   * GET /api/workers/right-to-work/records/:id
   */
  static async getRecord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const record = await RightToWorkModel.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      // Verify ownership
      if (record.worker_id !== req.user.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a right-to-work record
   * PATCH /api/workers/right-to-work/records/:id
   */
  static async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const record = await RightToWorkModel.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      // Verify ownership
      if (record.worker_id !== req.user.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const updates: any = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.share_status !== undefined) updates.share_status = req.body.share_status;
      if (req.body.documents_provided_at !== undefined) updates.documents_provided_at = new Date(req.body.documents_provided_at);

      const updated = await RightToWorkModel.update(id, updates);

      res.status(200).json({
        success: true,
        message: 'Record updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a right-to-work record
   * DELETE /api/workers/right-to-work/records/:id
   */
  static async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const record = await RightToWorkModel.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      // Verify ownership
      if (record.worker_id !== req.user.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await RightToWorkModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get verification status (any verified records?)
   * GET /api/workers/right-to-work/status
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasVerified = await RightToWorkModel.hasVerifiedRecords(req.user.userId);
      const records = await RightToWorkModel.findByWorkerId(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          is_verified: hasVerified,
          total_records: records.length,
          verified_count: records.filter(r => r.share_status === 'verified').length,
          records,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark documents as provided
   * PATCH /api/workers/right-to-work/records/:id/documents-provided
   */
  static async markDocumentsProvided(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const record = await RightToWorkModel.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      // Verify ownership
      if (record.worker_id !== req.user.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const updated = await RightToWorkModel.update(id, {
        documents_provided_at: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Documents marked as provided',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
