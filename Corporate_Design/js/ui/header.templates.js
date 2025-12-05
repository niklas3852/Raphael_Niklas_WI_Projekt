/**
 * header.templates.js
 * Enthält die HTML-Templates für den Header, spezifisch für jede Benutzerrolle.
 * Wird von header.js verwendet, um den passenden Header-Inhalt zu rendern.
 */
window.headerTemplates = {
  student: `
      <!-- Mittig: 4 Buttons -->
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Wissenschaftliche Arbeit -->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-wiss"
            >
              Wissenschaftliche Arbeit
            </button>
            <ul class="wi-dd__menu" id="dd-wiss" hidden>
              <li>
                <a role="menuitem" href="Anmeldung_Status_PA_BA/dashboard/dashboard.html"
                  >Dashboard</a
                >
              </li>
              <li>
                <a role="menuitem" href="Anmeldung_Status_PA_BA/thesis_registration/registration.html"
                  >Registrierung</a
                >
              </li>
            </ul>
          </div>

          <!-- Auslandssemester -->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-ausland"
            >
              Auslandssemester
            </button>
            <ul class="wi-dd__menu" id="dd-ausland" hidden>
              <li>
                <a role="menuitem" href="Antrag_LA/pages/step1.html">Beantragung Learning Agreement</a>
              </li>

              <li><a role="menuitem" href="Bericht_Auslandssemester/bericht_auslandssemester.html">Erfahrungsberichte</a></li>
            </ul>
          </div>

          <!-- Exkursion -->
          <div class="wi-dd">
            <a href="Laufende_Exkursion/exkursion-dashboard.html" class="btn primary">Exkursion</a>
          </div>

          <!-- Anmeldung Integrationseminar -->
          <div class="wi-dd">
            <a href="Verwaltung_Integrationsseminar/studenten.html" class="btn primary">Integrationsseminar</a>
          </div>

          <!-- Krankmeldungen -->
          <div class="wi-dd">
            <a href="Krankmeldungen/sekretariat.html" class="btn primary">Krankmeldung</a>
          </div>
        </nav>
        <!-- 
             data-append-course="true": 
             Signalisiert header.js, dass hier dynamisch die Kursnummer (z.B. TINF23A) 
             an den Link angehängt werden soll (sofern im User-Objekt vorhanden).
        -->
        <a class="wi-iconbtn" href="Uebersicht_Vorlesungen/view-plan.html" data-append-course="true" aria-label="Vorlesungsplan">
          <!-- Kalender-Icon -->
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM8 5H6v1H5h14h-1V5h-2v1H8V5Z"
            />
          </svg>
        </a>
  `,
  lecturer: `
  <!-- Mittig: 4 Buttons -->
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Wissenschaftliche Arbeit -->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-wiss"
            >
              Wissenschaftliche Arbeit
            </button>
            <ul class="wi-dd__menu" id="dd-wiss" hidden>
              <li>
                <a role="menuitem" href="Matching_PA_BA/Matching/Matching.html"
                  >Matching</a
                >
              </li>
              <li>
                <a role="menuitem" href="Betreuersicht_PA_BA/"
                  >Betreuung</a
                >
              </li>
            </ul>
          </div>

          <!-- Auslandssemester -->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-ausland"
            >
              Auslandssemester
            </button>
            <ul class="wi-dd__menu" id="dd-ausland" hidden>

              <li><a role="menuitem" href="Bericht_Auslandssemester/bericht_auslandssemester.html">Erfahrungsberichte</a></li>
            </ul>
          </div>

          <!-- Exkursion -->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-exkursion"
            >
              Exkursion
            </button>
            <ul class="wi-dd__menu" id="dd-exkursion" hidden>
              <li><a role="menuitem" href="#">Anmeldung</a></li>
              <li><a role="menuitem" href="#">Exkursionsplan</a></li>
            </ul>
          </div>

          <!-- Anmeldung Integrationsseminar -->
          <div class="wi-dd">
            <button class="btn primary">Integrationsseminar</button>
          </div>

          <!-- Krankmeldungen -->
          <div class="wi-dd">
            <button class="btn primary">Krankmeldungen</button>
          </div>
        </nav>
  `,
  secretariat: `
  <!-- Mittig: 4 Buttons -->
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Wissenschaftliche Arbeit -->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-wiss"
            >
              Wissenschaftliche Arbeit
            </button>
            <ul class="wi-dd__menu" id="dd-wiss" hidden>
              <li>
                <a role="menuitem" href="Matching_PA_BA/Dashboard/dashboard.html"
                  >Dashboard</a
                >
              </li>
              <li>
                <a role="menuitem" href="Matching_PA_BA/Matching/Matching.html"
                  >Matching</a
                >
              </li>
            </ul>
          </div>

          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-ausland"
            >
            Vorlesungsplan
            </button>
            <ul class="wi-dd__menu" id="dd-vorlesungsplan" hidden>
              <li><a role="menuitem" href="Uebersicht_Vorlesungen/view-day.html">Tagesplan</a></li>
              <li><a role="menuitem" href="Uebersicht_Vorlesungen/select-course.html">Vertretungsplan</a></li>
            </ul>
          </div>

          <!-- Auslandssemester -->
          <div class="wi-dd">
            <a href="Check_LAs/index.html" class="btn primary">Auslandssemester</a>
          </div>

          <!-- Exkursion -->
          <div class="wi-dd">
            <a href="Anmeldung_Exkursion/index.html" class="btn primary">Exkursion</a>
          </div>

          <!-- Anmeldung Integrationseminar -->
          <div class="wi-dd">
            <a href="Verwaltung_Integrationsseminar/hochschule.html" class="btn primary">Integrationsseminar</a>
          </div>

          <!-- Krankmeldungen -->
          <div class="wi-dd">
            <a href="Krankmeldungen/sekretariat.html" class="btn primary">Krankmeldung</a>
          </div>
        </nav>
  `,
  study_director: `
    <!-- Mittig: 4 Buttons -->
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Wissenschaftliche Arbeit --------------------------------------------------->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-wiss"
            >
              Wissenschaftliche Arbeit
            </button>
            <ul class="wi-dd__menu" id="dd-wiss" hidden>
              <li>
                <a role="menuitem" href="Matching_PA_BA/Dashboard/dashboard.html"
                  >Dashboard</a
                >
              </li>
              <li>
                <a role="menuitem" href="Matching_PA_BA/Matching/Matching.html"
                  >Matching</a
                >
              </li>
              <li>
                <a role="menuitem" href="Betreuersicht_PA_BA/"
                  >Betreuung</a
                >
              </li>
            </ul>
          </div>

          <!-- Vorlesungsplan --------------------------------------------------->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-ausland"
            >
            Vorlesungsplan
            </button>
            <ul class="wi-dd__menu" id="dd-vorlesungsplan" hidden>
              <li><a role="menuitem" href="Uebersicht_Vorlesungen/view-day.html">Tagesplan</a></li>
              <li><a role="menuitem" href="Uebersicht_Vorlesungen/select-course.html">Vertretungsplan</a></li>
            </ul>
          </div>

          <!-- Auslandssemester --------------------------------------------------->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-ausland"
            >
              Auslandssemester
            </button>
            <ul class="wi-dd__menu" id="dd-ausland" hidden>
              <li>
                <a role="menuitem" href="Check_LAs/index.html">Learning Agreements</a>
              </li>

              <li><a role="menuitem" href="Bericht_Auslandssemester/bericht_auslandssemester.html">Erfahrungsberichte</a></li>
            </ul>
          </div>

          <!-- Exkursion --------------------------------------------------->
          <div class="wi-dd">
            <a href="Anmeldung_Exkursion/index.html" class="btn primary">Exkursion</a>
          </div>

          <!-- Anmeldung Integrationseminar --------------------------------------------------->
          <div class="wi-dd">
            <a href="Verwaltung_Integrationsseminar/hochschule.html" class="btn primary">Integrationsseminar</a>
          </div>

          <!-- Krankmeldungen --------------------------------------------------->
          <div class="wi-dd">
            <a href="Krankmeldungen/sekretariat.html" class="btn primary">Krankmeldung</a>
          </div>
        </nav>
  `,
  management: `
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Vorlesungsplan --------------------------------------------------->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-ausland"
            >
            Vorlesungsplan
            </button>
            <ul class="wi-dd__menu" id="dd-vorlesungsplan" hidden>
              <li><a role="menuitem" href="Uebersicht_Vorlesungen/view-day.html">Tagesplan</a></li>
              <li><a role="menuitem" href="Uebersicht_Vorlesungen/select-course.html">Vertretungsplan</a></li>
            </ul>
          </div>

          <!-- Exkursion --------------------------------------------------->
          <div class="wi-dd">
            <a href="Anmeldung_Exkursion/index.html" class="btn primary">Exkursion</a>
          </div>
        </nav>
  `,
  partner: `
    <!-- Mittig: 4 Buttons -->
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Exkursion --------------------------------------------------->
          <div class="wi-dd">
            <a href="Anmeldung_Exkursion/index.html" class="btn primary">Exkursion</a>
          </div>

          <!-- Anmeldung Integrationseminar --------------------------------------------------->
          <div class="wi-dd">
            <a href="Verwaltung_Integrationsseminar/unternehmen.html" class="btn primary">Integrationsseminar</a>
          </div>
        </nav>
  `,
  supervisor: `
    <!-- Mittig: 4 Buttons -->
        <nav class="wi-nav" aria-label="Bereiche">
          <!-- Wissenschaftliche Arbeit --------------------------------------------------->
          <div class="wi-dd">
            <button
              class="btn primary"
              aria-expanded="false"
              aria-controls="dd-wiss"
            >
              Wissenschaftliche Arbeit
            </button>
            <ul class="wi-dd__menu" id="dd-wiss" hidden>
              <li>
                <a role="menuitem" href="Matching_PA_BA/Dashboard/dashboard.html"
                  >Dashboard</a
                >
              </li>
              <li>
                <a role="menuitem" href="Betreuersicht_PA_BA/"
                  >Betreuung</a
                >
              </li>
            </ul>
          </div>

          <!-- Exkursion --------------------------------------------------->
          <div class="wi-dd">
            <a href="Anmeldung_Exkursion/index.html" class="btn primary">Exkursion</a>
          </div>
  `,
  default: ``,
};
