import { supabase } from "@/integrations/supabase/client";
import { getNicheTemplate, generateTagColor } from "@/data/nicheTemplates";

export class NicheDataInitializer {
  private userId: string;
  private businessType: string;

  constructor(userId: string, businessType: string) {
    this.userId = userId;
    this.businessType = businessType;
  }

  async initializeAllData(options: {
    setupProducts?: boolean;
    setupTags?: boolean;
    setupCustomFields?: boolean;
    setupAutomations?: boolean;
    setupEmailTemplates?: boolean;
  } = {}) {
    const template = getNicheTemplate(this.businessType);
    
    if (!template) {
      console.error(`No template found for business type: ${this.businessType}`);
      return;
    }

    const results = {
      products: { success: false, count: 0 },
      tags: { success: false, count: 0 },
      customFields: { success: false, count: 0 },
      automations: { success: false, count: 0 },
      emailTemplates: { success: false, count: 0 }
    };

    try {
      // Initialize products/services
      if (options.setupProducts !== false && template.products?.length > 0) {
        results.products = await this.initializeProducts(template.products);
      }
      // Initialize tags
      if (options.setupTags !== false && template.tags?.length > 0) {
        results.tags = await this.initializeTags(template.tags);
      }

      // Initialize custom fields
      if (options.setupCustomFields !== false && template.customFields) {
        results.customFields = await this.initializeCustomFields(template.customFields);
      }

      // Initialize automations
      if (options.setupAutomations !== false && template.automations?.length > 0) {
        results.automations = await this.initializeAutomations(template.automations);
      }

      // Initialize email templates
      if (options.setupEmailTemplates !== false && template.emailTemplates?.length > 0) {
        results.emailTemplates = await this.initializeEmailTemplates(template.emailTemplates);
      }

      console.log("Niche data initialization results:", results);
      return results;

    } catch (error) {
      console.error("Error initializing niche data:", error);
      throw error;
    }
  }
  private async initializeProducts(products: any[]) {
    try {
      const productsToInsert = products.map(product => ({
        ...product,
        user_id: this.userId,
        created_by: this.userId,
        is_active: true
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) throw error;

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      console.error("Error initializing products:", error);
      return { success: false, count: 0 };
    }
  }

  private async initializeTags(tags: string[]) {
    try {
      const tagsToInsert = tags.map(tag => ({
        name: tag,
        color: generateTagColor(),
        user_id: this.userId,
        created_by: this.userId
      }));

      const { data, error } = await supabase
        .from('tags')
        .insert(tagsToInsert)
        .select();
      if (error) throw error;

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      console.error("Error initializing tags:", error);
      return { success: false, count: 0 };
    }
  }

  private async initializeCustomFields(customFields: { jobs?: string[], clients?: string[] }) {
    try {
      const fieldsToInsert = [];

      // Add job custom fields
      if (customFields.jobs) {
        customFields.jobs.forEach(fieldName => {
          fieldsToInsert.push({
            name: fieldName,
            entity_type: 'job',
            field_type: 'text',
            is_required: false,
            user_id: this.userId,
            created_by: this.userId
          });
        });
      }

      // Add client custom fields
      if (customFields.clients) {
        customFields.clients.forEach(fieldName => {
          fieldsToInsert.push({
            name: fieldName,
            entity_type: 'client',
            field_type: 'text',
            is_required: false,
            user_id: this.userId,
            created_by: this.userId
          });
        });
      }
      if (fieldsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('custom_fields')
          .insert(fieldsToInsert)
          .select();

        if (error) throw error;

        return { success: true, count: data?.length || 0 };
      }

      return { success: true, count: 0 };
    } catch (error) {
      console.error("Error initializing custom fields:", error);
      return { success: false, count: 0 };
    }
  }

  private async initializeAutomations(automations: any[]) {
    try {
      const automationsToInsert = automations.map(automation => ({
        ...automation,
        is_active: true,
        user_id: this.userId,
        created_by: this.userId
      }));

      const { data, error } = await supabase
        .from('automations')
        .insert(automationsToInsert)
        .select();

      if (error) throw error;

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      console.error("Error initializing automations:", error);
      return { success: false, count: 0 };
    }
  }

  private async initializeEmailTemplates(emailTemplates: any[]) {
    try {
      const templatesToInsert = emailTemplates.map(template => ({
        ...template,
        type: 'email',
        is_active: true,
        user_id: this.userId,
        created_by: this.userId
      }));

      const { data, error } = await supabase
        .from('message_templates')
        .insert(templatesToInsert)
        .select();

      if (error) throw error;

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      console.error("Error initializing email templates:", error);
      return { success: false, count: 0 };
    }
  }
}