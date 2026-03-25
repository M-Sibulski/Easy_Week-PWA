import App from "./App";
import { render, screen } from "@testing-library/react";
import {describe, it, expect} from "vitest";
import "@testing-library/jest-dom/vitest";


describe("App", () => {
    
    
    it("renders", () => {
        render(<App/>);
        expect(screen.getByTestId("app")).toBeInTheDocument();
    })
})