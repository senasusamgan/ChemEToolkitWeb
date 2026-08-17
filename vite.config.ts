import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized =
            id.replaceAll(
              '\\',
              '/',
            )

          if (
            normalized.includes(
              '/node_modules/react',
            ) ||
            normalized.includes(
              '/node_modules/react-dom',
            )
          ) {
            return 'vendor-react'
          }

          if (
            normalized.includes(
              '/src/data/calculators',
            )
          ) {
            return 'calculator-catalog'
          }

          if (
            normalized.includes(
              '/src/features/fluid-mechanics/',
            )
          ) {
            return undefined
          }

          if (
            normalized.includes(
              '/src/features/',
            )
          ) {
            const featurePath =
              normalized.split(
                '/src/features/',
              )[1]

            const category =
              featurePath
                ?.split('/')[0]
                ?.replace(
                  /[^a-zA-Z0-9-]/g,
                  '-',
                )

            if (category) {
              return (
                'feature-' +
                category
              )
            }
          }

          const workspaceModules = [
            '/src/components/EngineeringWorkspace',
            '/src/components/Workspace',
            '/src/components/CalculationExport',
            '/src/components/CalculationHistory',
            '/src/components/CalculationComparison',
            '/src/components/SavedComparisons',
            '/src/components/ProjectWorkspaces',
            '/src/components/ProjectFiles',
            '/src/components/PersonalDataBackup',
          ]

          if (
            workspaceModules.some(
              (modulePath) =>
                normalized.includes(
                  modulePath,
                ),
            )
          ) {
            return 'workspace'
          }

          return undefined
        },
      },
    },
  },
})
