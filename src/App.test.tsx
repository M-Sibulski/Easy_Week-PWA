import App from "./App";
import { render, screen } from "@testing-library/react";
import {describe, it, expect} from "vitest";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";


describe("App", () => {
    
    
    it("renders", () => {
        render(<App/>);
        expect(screen.getByText("vite-project")).toBeInTheDocument();
    })

    it("renders a default '0' on counter", () => {
        render(<App/>);
        const counterButton = screen.getByTestId("counter-button");
        expect(counterButton.textContent).toEqual("count is 0");
    })
    
    it("renders count + 1", async () => {
        render(<App/>);
        const counterButton = await screen.getByTestId("counter-button");
        await userEvent.click(counterButton);
        await screen.findByText("count is 1");
        expect(counterButton.textContent).toEqual("count is 1");
    })
})