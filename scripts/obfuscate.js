const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const DIST_DIR = path.join(__dirname, '..', 'dist', 'blast-app', 'browser');

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.3,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: false,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: false,
  stringArray: true,
  stringArrayCallsTransform: false,
  stringArrayEncoding: [],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersChainedCalls: false,
  stringArrayWrappersParametersMaxCount: 2,
  stringArrayWrappersType: 'variable',
  stringArrayThreshold: 0.5,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  reservedNames: [
    '^ng',
    '^ɵ',
    'subscribe',
    'pipe',
    'next',
    'error',
    'complete',
    'unsubscribe',
    'Observable',
    'Subject',
    'BehaviorSubject',
    'signal',
    'computed',
    'effect',
    'inject',
    'Component',
    'Injectable',
    'NgModule',
    'Directive',
    'Pipe',
    'Input',
    'Output',
    'ViewChild',
    'ContentChild',
    'HostListener',
    'HostBinding'
  ],
  reservedStrings: [
    'ngOnInit',
    'ngOnDestroy',
    'ngAfterViewInit',
    'ngOnChanges'
  ]
};

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
  fs.writeFileSync(filePath, obfuscatedCode);
  console.log(`Obfuscated: ${path.basename(filePath)}`);
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    console.error('Run "npm run build" first to generate the dist folder.');
    process.exit(1);
  }

  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += processDirectory(filePath);
    } else if (file.endsWith('.js') && !file.includes('polyfills') && !file.includes('worker')) {
      obfuscateFile(filePath);
      count++;
    }
  }

  return count;
}

console.log('');
console.log('  ╔══════════════════════════════════════════╗');
console.log('  ║      Made with <3 by Blubber Lounge      ║');
console.log('  ║      https://blubber-lounge.de/          ║');
console.log('  ║      © 2026 All Rights Reserved          ║');
console.log('  ╚══════════════════════════════════════════╝');
console.log('');
console.log('Starting obfuscation...');
console.log(`Target: ${DIST_DIR}\n`);

const startTime = Date.now();
const fileCount = processDirectory(DIST_DIR);
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\nObfuscation complete! ${fileCount} files processed in ${duration}s`);
