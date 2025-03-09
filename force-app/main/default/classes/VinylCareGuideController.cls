public with sharing class VinylCareGuideController {
    public class CareGuideSection {
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public List<CareGuideItem> items { get; set; }
    }

    public class CareGuideItem {
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public String iconName { get; set; }

        public CareGuideItem(String title, String description, String type) {
            this.title = title;
            this.description = description;
            this.type = type;
            this.iconName = getIconNameForType(type);
        }

        private String getIconNameForType(String type) {
            Map<String, String> iconMap = new Map<String, String>{
                'tip' => 'utility:info',
                'product' => 'utility:cart',
                'storage' => 'utility:archive',
                'issue' => 'utility:warning'
            };
            return iconMap.containsKey(type) ? iconMap.get(type) : 'utility:info';
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<CareGuideSection> getVinylCareGuide() {
        List<CareGuideSection> sections = new List<CareGuideSection>();

        // Basic Care Tips
        CareGuideSection basicCare = new CareGuideSection();
        basicCare.title = 'Basic Care Tips';
        basicCare.description = 'Essential tips for maintaining your vinyl records';
        basicCare.items = new List<CareGuideItem>{
            new CareGuideItem(
                'Handle with Care',
                'Always handle vinyl records by their edges and label area. Avoid touching the playing surface.',
                'tip'
            ),
            new CareGuideItem(
                'Clean Before Playing',
                'Give your records a quick brush with an anti-static brush before each play to remove dust.',
                'tip'
            ),
            new CareGuideItem(
                'Proper Storage',
                'Store records vertically in their sleeves, avoid stacking them horizontally.',
                'tip'
            )
        };
        sections.add(basicCare);

        // Cleaning Products
        CareGuideSection cleaningProducts = new CareGuideSection();
        cleaningProducts.title = 'Recommended Cleaning Products';
        cleaningProducts.description = 'Essential tools and products for vinyl maintenance';
        cleaningProducts.items = new List<CareGuideItem>{
            new CareGuideItem(
                'Anti-static Brush',
                'Essential for removing dust before playing. Use with light pressure.',
                'product'
            ),
            new CareGuideItem(
                'Record Cleaning Solution',
                'Specialized cleaning solution for deep cleaning. Alcohol-free formula recommended.',
                'product'
            ),
            new CareGuideItem(
                'Microfiber Cloth',
                'Lint-free cloth for applying cleaning solution and drying.',
                'product'
            )
        };
        sections.add(cleaningProducts);

        // Storage Recommendations
        CareGuideSection storage = new CareGuideSection();
        storage.title = 'Storage Recommendations';
        storage.description = 'Best practices for storing your vinyl collection';
        storage.items = new List<CareGuideItem>{
            new CareGuideItem(
                'Temperature Control',
                'Store records at room temperature (65-70°F). Avoid extreme temperatures.',
                'storage'
            ),
            new CareGuideItem(
                'Inner Sleeves',
                'Use anti-static, acid-free inner sleeves to protect from dust and static.',
                'storage'
            ),
            new CareGuideItem(
                'Outer Sleeves',
                'Protect album covers with clear, archival-quality outer sleeves.',
                'storage'
            )
        };
        sections.add(storage);

        // Common Issues
        CareGuideSection issues = new CareGuideSection();
        issues.title = 'Common Issues & Solutions';
        issues.description = 'Troubleshooting guide for common vinyl problems';
        issues.items = new List<CareGuideItem>{
            new CareGuideItem(
                'Static Build-up',
                'Use an anti-static brush and maintain proper humidity levels (45-50%).',
                'issue'
            ),
            new CareGuideItem(
                'Warping',
                'Store records vertically and away from heat sources. Use record weights during playback.',
                'issue'
            ),
            new CareGuideItem(
                'Surface Noise',
                'Clean records thoroughly and ensure proper cartridge alignment and tracking force.',
                'issue'
            )
        };
        sections.add(issues);

        return sections;
    }
} 