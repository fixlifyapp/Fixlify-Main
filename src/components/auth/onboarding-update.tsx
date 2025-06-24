// Updated UnifiedOnboardingModal integration
// Add this import at the top of UnifiedOnboardingModal.tsx:
// import { NicheDataInitializer } from "@/services/nicheDataInitializer";

// Replace the existing initializeUserData function with this enhanced version:

const initializeUserDataEnhanced = async () => {
  try {
    setIsLoading(true);
    console.log("Starting enhanced onboarding for user:", userId);
    console.log("Business type selected:", formData.businessType);

    // Step 1: Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        business_niche: formData.businessType,
        referral_source: formData.referralSource,
        has_completed_onboarding: true
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Step 2: Handle company settings
    const { data: existingCompany } = await supabase
      .from('company_settings')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    const companyData = {
      company_name: formData.businessName,
      business_type: formData.businessType,
      business_niche: formData.businessType,
      team_size: formData.teamSize
    };
    if (existingCompany) {
      await supabase
        .from('company_settings')
        .update(companyData)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('company_settings')
        .insert({ ...companyData, user_id: userId });
    }

    // Step 3: Initialize defaults using existing RPC
    await supabase.rpc('initialize_user_defaults', { p_user_id: userId });

    // Step 4: Use the new NicheDataInitializer for enhanced setup
    const nicheInitializer = new NicheDataInitializer(userId, formData.businessType);
    
    const initResults = await nicheInitializer.initializeAllData({
      setupProducts: formData.setupProducts,
      setupTags: formData.setupTags,
      setupCustomFields: true,
      setupAutomations: true,
      setupEmailTemplates: true
    });

    console.log("Niche initialization results:", initResults);

    // Step 5: Also run the existing enhanced niche data loader for compatibility
    try {
      const { initializeNicheData } = await import('@/utils/enhanced-niche-data-loader');
      await initializeNicheData(formData.businessType);
    } catch (error) {
      console.error('Enhanced niche data loader error:', error);
    }
    // Step 6: Verify data was created successfully
    const verifyInitialization = async () => {
      const [products, tags] = await Promise.all([
        supabase.from('products').select('count').eq('user_id', userId),
        supabase.from('tags').select('count').eq('user_id', userId)
      ]);
      
      console.log(`Created ${products.data?.[0]?.count || 0} products`);
      console.log(`Created ${tags.data?.[0]?.count || 0} tags`);
    };
    
    await verifyInitialization();

    // Success!
    toast.success(`Welcome to Fixlify! Your ${formData.businessType} workspace is ready.`);
    onComplete();
    navigate('/dashboard');

  } catch (error: any) {
    console.error("Onboarding error:", error);
    
    // Specific error messages
    let errorMessage = "Setup failed. Please try again.";
    
    if (error.message?.includes('products')) {
      errorMessage = "Failed to create products. Manual setup may be required.";
    } else if (error.message?.includes('tags')) {
      errorMessage = "Failed to create tags. You can add them manually later.";
    }
    
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};