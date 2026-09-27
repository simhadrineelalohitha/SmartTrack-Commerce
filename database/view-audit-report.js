/**
 * View Audit Report from Database
 * Retrieves and displays audit report data
 */

const db = require('./db-factory');

function viewLatestAuditReport() {
  return new Promise((resolve, reject) => {
    // Get the latest audit report
    db.get(`
      SELECT * FROM audit_reports 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [], (err, report) => {
      if (err) {
        return reject(err);
      }
      
      if (!report) {
        console.log('No audit reports found in database.');
        return resolve(null);
      }
      
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('              E-COMMERCE AUDIT REPORT');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`Audit Date: ${report.audit_date}`);
      console.log(`Version: ${report.audit_version}`);
      console.log(`Status: ${report.status}`);
      console.log(`Overall Score: ${report.overall_score}/100`);
      console.log(`Critical Issues: ${report.critical_issues_fixed}/${report.critical_issues_found} Fixed`);
      console.log('');
      
      // Get issues
      db.all(`
        SELECT * FROM audit_issues 
        WHERE audit_report_id = ? 
        ORDER BY 
          CASE severity 
            WHEN 'CRITICAL' THEN 1 
            WHEN 'HIGH' THEN 2 
            WHEN 'MEDIUM' THEN 3 
            WHEN 'LOW' THEN 4 
          END
      `, [report.id], (err, issues) => {
        if (err) return reject(err);
        
        console.log('───────────────────────────────────────────────────────');
        console.log('                 ISSUES FIXED');
        console.log('───────────────────────────────────────────────────────');
        issues.forEach((issue, index) => {
          console.log(`\n${index + 1}. [${issue.severity}] ${issue.title}`);
          console.log(`   Category: ${issue.category}`);
          console.log(`   Status: ${issue.status}`);
          console.log(`   Description: ${issue.description}`);
          console.log(`   Impact: ${issue.impact}`);
          console.log(`   Solution: ${issue.solution}`);
          console.log(`   Files Changed: ${issue.files_changed}`);
          console.log(`   Fixed: ${issue.date_fixed}`);
        });
        
        // Get test results
        db.all(`
          SELECT * FROM audit_test_results 
          WHERE audit_report_id = ?
        `, [report.id], (err, tests) => {
          if (err) return reject(err);
          
          console.log('');
          console.log('───────────────────────────────────────────────────────');
          console.log('                 TEST RESULTS');
          console.log('───────────────────────────────────────────────────────');
          tests.forEach(test => {
            const emoji = test.status === 'PASS' ? '✅' : 
                         test.status === 'NEEDS_TESTING' ? '🔍' : '❌';
            console.log(`${emoji} ${test.category}: ${test.status} (${test.score}/100)`);
            console.log(`   ${test.notes}`);
          });
          
          // Get files modified
          db.all(`
            SELECT * FROM audit_files_modified 
            WHERE audit_report_id = ?
          `, [report.id], (err, files) => {
            if (err) return reject(err);
            
            console.log('');
            console.log('───────────────────────────────────────────────────────');
            console.log('              FILES MODIFIED');
            console.log('───────────────────────────────────────────────────────');
            files.forEach(file => {
              console.log(`📄 ${file.file_path} (${file.category})`);
              console.log(`   Changes: ${file.changes}`);
            });
            
            // Get recommendations
            db.all(`
              SELECT * FROM audit_recommendations 
              WHERE audit_report_id = ?
              ORDER BY 
                CASE priority 
                  WHEN 'HIGH' THEN 1 
                  WHEN 'MEDIUM' THEN 2 
                  WHEN 'LOW' THEN 3 
                END
            `, [report.id], (err, recommendations) => {
              if (err) return reject(err);
              
              console.log('');
              console.log('───────────────────────────────────────────────────────');
              console.log('              RECOMMENDATIONS');
              console.log('───────────────────────────────────────────────────────');
              recommendations.forEach(rec => {
                const icon = rec.priority === 'HIGH' ? '🔴' : 
                            rec.priority === 'MEDIUM' ? '🟡' : '🟢';
                console.log(`${icon} [${rec.priority}] ${rec.item}`);
              });
              
              console.log('');
              console.log('═══════════════════════════════════════════════════════');
              console.log('');
              
              resolve(report);
            });
          });
        });
      });
    });
  });
}

function viewAllAuditReports() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id, audit_date, status, overall_score, 
        critical_issues_fixed, critical_issues_found,
        created_at
      FROM audit_reports 
      ORDER BY created_at DESC
    `, [], (err, reports) => {
      if (err) return reject(err);
      
      console.log('');
      console.log('All Audit Reports:');
      console.log('==================');
      reports.forEach(report => {
        console.log(`ID ${report.id}: ${report.audit_date} - ${report.status} (Score: ${report.overall_score}/100)`);
      });
      console.log('');
      
      resolve(reports);
    });
  });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args[0] === '--all') {
      await viewAllAuditReports();
    } else {
      await viewLatestAuditReport();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error viewing audit report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { viewLatestAuditReport, viewAllAuditReports };
