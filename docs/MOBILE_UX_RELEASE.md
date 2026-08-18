# ChemE Toolkit — Mobile UX Release

The first dedicated ChemE Toolkit mobile experience release covers the primary product workflow from navigation to engineering calculation and project management.

## Supported layout contract

Primary mobile handoff:

- 768 px and below

Dedicated compact viewport contracts:

- 430 px
- 390 px
- 375 px
- 360 px calculator fallback

## Mobile shell

The mobile shell provides:

- compact navigation
- mobile menu
- safe horizontal gutters
- mobile scroll offsets
- mobile-safe search sizing
- touch-oriented controls
- protection against horizontal page overflow

## Homepage

The homepage mobile experience provides:

- true single-column hierarchy
- responsive hero typography
- full-width search
- swipeable category shortcuts
- non-sticky live calculator surface
- swipeable workspace actions
- single-column calculator and category cards

## Calculator experience

The calculator mobile experience provides:

- native mobile calculator selector
- single-column engineering inputs
- 16 px input text to avoid mobile browser zoom
- full-width primary calculation action
- non-obstructive action layout
- compact results
- 360 px result fallback
- formula overflow handling
- table overflow handling
- swipeable session controls

## Scientific Notebook

The Scientific Notebook mobile experience provides:

- single-column notebook fields
- mobile-safe text areas
- touch-friendly save and snapshot actions
- swipeable secondary action rails
- overflow-safe comparison tables

## Notebook Library and Project Sets

The mobile library provides:

- compact statistics
- single-column controls
- single-column notebook cards
- swipeable card actions
- single-column project editing
- swipeable portfolio metrics
- swipeable priority, deadline and attention controls
- compact project health dashboard
- compact Focus Next queue

## Problem Solver

The mobile Problem Solver provides:

- single-column solver hierarchy
- mobile-sized heading
- swipeable process guide
- 16 px form controls
- full-width primary action
- overflow-safe code and engineering tables

## Architecture

Mobile-specific overrides live in:

`src/styles/mobile-experience.css`

The mobile experience layer loads after the App style graph so it can safely normalize older responsive rules without modifying desktop layout contracts.

## Release policy

Future UI work must preserve:

- 768 px mobile handoff
- 430 / 390 / 375 compact contracts
- calculator input zoom protection
- calculator table/formula overflow protection
- mobile Notebook and Project Sets layouts
- Problem Solver mobile hierarchy
- mobile verifier ordering
- desktop layout behavior

Real-device adjustments should be targeted fixes based on observed device behavior rather than another broad CSS rewrite.
