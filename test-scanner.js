import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const WORLDS_DIRECTORY = './worlds';

async function testScanner() {
	try {
		console.log('Testing world scanner...');
		console.log('Worlds directory:', WORLDS_DIRECTORY);
		
		const files = await readdir(WORLDS_DIRECTORY);
		console.log('Found files:', files.length);
		
		for (const filename of files.slice(0, 3)) { // Test first 3 files
			console.log('\nProcessing:', filename);
			
			const filePath = join(WORLDS_DIRECTORY, filename);
			const fileStats = await stat(filePath);
			
			console.log('- Size:', fileStats.size);
			console.log('- Modified:', fileStats.mtime);
			
			// Parse filename
			const nameWithoutExt = filename.replace(/\.(tar\.xz|zip|tar\.gz)$/, '');
			const parts = nameWithoutExt.split('__');
			console.log('- Parts:', parts);
		}
		
		console.log('\n✅ Scanner test completed successfully');
	} catch (error) {
		console.error('❌ Scanner test failed:', error);
	}
}

testScanner();